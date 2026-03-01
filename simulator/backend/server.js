import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { simulatorRouter } from './routes/simulator.js';
import { communityRouter } from './routes/community.js';
import { sleepStoryRouter } from './routes/sleepStory.js';
import { burnoutRouter } from './routes/burnout.js';
import { mindCafeRouter } from './routes/mindcafe.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
];
app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // return null (block) instead of throwing — avoids 500
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/simulator', simulatorRouter);
app.use('/api/community', communityRouter);
app.use('/api/sleep', sleepStoryRouter);
app.use('/api/burnout', burnoutRouter);
app.use('/api/mindcafe', mindCafeRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', module: 'Reality Simulator' }));

app.listen(PORT, () => {
  console.log(`\n🎭 MindTrace Reality Simulator backend running on http://localhost:${PORT}\n`);
});
