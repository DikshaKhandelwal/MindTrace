import { Router } from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = path.resolve(__dirname, '../data/posts.json');

// ── File-based post store ─────────────────────────────────────────────────────
function readPosts() {
  try {
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

// Compute relative timeAgo string from ISO createdAt
function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const ANON_NAMES = [
  'Quiet River', 'Autumn Leaf', 'Mountain Echo', 'Silver Thread', 'Still Lake',
  'Fern Hill', 'Willow Bend', 'Open Road', 'Gentle Storm', 'Bright Moss',
  'Coastal Wind', 'Birch Grove', 'Morning Tide', 'Stone Path', 'Dusk Meadow',
  'Distant Cloud', 'Ember Glow', 'Hollow Reed', 'Tidal Stone', 'Pale Lantern',
];

const ANON_COLORS = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#14b8a6', '#6366f1',
  '#ec4899', '#0ea5e9', '#7c3aed', '#10b981', '#f97316',
];

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── OpenAI ───────────────────────────────────────────────────────────────────
let _client = null;
function getOpenAI() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export const communityRouter = Router();

// ── GET /api/community/posts?category=all ─────────────────────────────────────
communityRouter.get('/posts', (req, res) => {
  const { category } = req.query;
  let posts = readPosts();
  if (category && category !== 'all') {
    posts = posts.filter(p => p.category === category);
  }
  // Refresh timeAgo dynamically
  posts = posts.map(p => ({ ...p, timeAgo: timeAgo(p.createdAt) }));
  return res.json(posts.reverse()); // newest first
});

// ── POST /api/community/react/:id ─────────────────────────────────────────────
// Body: { type: 'heart' | 'hug' | 'relate', delta: 1 | -1 }
communityRouter.post('/react/:id', (req, res) => {
  const { id } = req.params;
  const { type, delta } = req.body;
  if (!['heart', 'hug', 'relate'].includes(type)) {
    return res.status(400).json({ error: 'Invalid reaction type.' });
  }
  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Post not found.' });

  posts[idx].reactions[type] = Math.max(0, (posts[idx].reactions[type] ?? 0) + (delta === -1 ? -1 : 1));
  writePosts(posts);
  return res.json({ reactions: posts[idx].reactions });
});

// ── POST /api/community/submit ────────────────────────────────────────────────
// Body: { content, category?, isVent? }
// Returns: { isCrisis, compassion, suggestedCircle, post? }
communityRouter.post('/submit', async (req, res) => {
  const { content, category, isVent = false } = req.body;
  if (!content || content.trim().length < 5) {
    return res.status(400).json({ error: 'Content too short.' });
  }

  try {
    const openai = getOpenAI();

    const systemPrompt = `You are a compassionate mental health community assistant.
Your task:
1. Detect if the message contains crisis indicators (suicidal ideation, self-harm intent, immediate danger).
2. If NOT a crisis: write a warm, non-judgmental, 2-3 sentence response that acknowledges the person's feelings without giving advice. Be human, gentle, and real. Do not use placeholders or generic phrases.
3. Suggest which circle/category best fits: anxiety, grief, relationships, burnout, growth, depression, transitions, student.

Respond ONLY in this JSON format (no markdown):
{
  "isCrisis": boolean,
  "compassion": "string (empty if isCrisis is true)",
  "suggestedCircle": "string"
}`;

    const { choices } = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: content.trim() },
      ],
      temperature: 0.7,
      max_tokens: 250,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(choices[0].message.content);
    const isCrisis       = Boolean(parsed.isCrisis);
    const compassion     = parsed.compassion || '';
    const suggestedCircle = parsed.suggestedCircle || category || '';

    // Save to store when it's a community post (not a private vent) and not a crisis
    let savedPost = null;
    if (!isVent && !isCrisis) {
      const posts = readPosts();
      savedPost = {
        id:            randomUUID(),
        anonymousName: randomPick(ANON_NAMES),
        avatarColor:   randomPick(ANON_COLORS),
        createdAt:     new Date().toISOString(),
        timeAgo:       'just now',
        category:      suggestedCircle || category || 'growth',
        content:       content.trim(),
        reactions:     { heart: 0, hug: 0, relate: 0 },
        compassion,
      };
      posts.unshift(savedPost);
      writePosts(posts);
    }

    return res.json({ isCrisis, compassion, suggestedCircle, post: savedPost });
  } catch (err) {
    console.error('[community/submit]', err.message);
    // Fallback — never break the client experience, still save the post
    let savedPost = null;
    if (!isVent) {
      const posts = readPosts();
      savedPost = {
        id:            randomUUID(),
        anonymousName: randomPick(ANON_NAMES),
        avatarColor:   randomPick(ANON_COLORS),
        createdAt:     new Date().toISOString(),
        timeAgo:       'just now',
        category:      category || 'growth',
        content:       content.trim(),
        reactions:     { heart: 0, hug: 0, relate: 0 },
        compassion:    'Thank you for trusting this space. What you feel is valid, and you are not alone in it.',
      };
      posts.unshift(savedPost);
      writePosts(posts);
    }
    return res.json({
      isCrisis:        false,
      compassion:      'Thank you for trusting this space. What you feel is valid, and you are not alone in it.',
      suggestedCircle: category || '',
      post:            savedPost,
    });
  }
});

// ── POST /api/community/checkin ───────────────────────────────────────────────
communityRouter.post('/checkin', async (req, res) => {
  const { mood } = req.body;
  if (!mood) return res.status(400).json({ error: 'Mood is required.' });

  function jitter(base) {
    return Math.max(1, base + Math.floor(Math.random() * 7 - 3));
  }

  const communityMood = {
    peaceful:     jitter(18),
    hopeful:      jitter(22),
    anxious:      jitter(20),
    heavy:        jitter(14),
    disconnected: jitter(10),
    overwhelmed:  jitter(11),
    grateful:     jitter(14),
  };

  const messages = {
    peaceful:     "You're not alone in this calm. Others are finding moments of peace today too.",
    hopeful:      "Hope is a quiet strength. Others are holding it alongside you.",
    anxious:      "Many people here know this feeling well. You're in good company.",
    heavy:        "Heaviness is real — and so are the people here carrying their own weight with you.",
    disconnected: "Disconnection is one of the hardest feelings. You reached out, and that matters.",
    overwhelmed:  "Overwhelm passes, even when it doesn't feel like it will. You're not alone.",
    grateful:     "Gratitude is contagious. You just made someone else's day a little warmer.",
  };

  return res.json({
    communityMood,
    message: messages[mood] ?? 'Thank you for checking in today.',
  });
});
