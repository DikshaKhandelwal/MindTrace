import { Router } from 'express';
import OpenAI from 'openai';

let _client = null;
function getOpenAI() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export const communityRouter = Router();

// POST /api/community/submit
// Body: { content: string, category?: string, isVent?: boolean }
// Returns: { isCrisis: boolean, compassion: string, suggestedCircle?: string }
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
    return res.json({
      isCrisis:       Boolean(parsed.isCrisis),
      compassion:     parsed.compassion || '',
      suggestedCircle: parsed.suggestedCircle || category || '',
    });
  } catch (err) {
    console.error('[community/submit]', err.message);
    // Fallback — never break the client experience
    return res.json({
      isCrisis:       false,
      compassion:     'Thank you for trusting this space. What you feel is valid, and you are not alone in it.',
      suggestedCircle: category || '',
    });
  }
});

// POST /api/community/checkin
// Body: { mood: string, note?: string }
// Returns: { communityMood: { [mood]: number }, message: string }
communityRouter.post('/checkin', async (req, res) => {
  const { mood } = req.body;
  if (!mood) return res.status(400).json({ error: 'Mood is required.' });

  // Simulated community distribution with slight randomization
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
    peaceful:     'You\'re not alone in this calm. Others are finding moments of peace today too.',
    hopeful:      'Hope is a quiet strength. Others are holding it alongside you.',
    anxious:      'Many people here know this feeling well. You\'re in good company.',
    heavy:        'Heaviness is real — and so are the people here carrying their own weight with you.',
    disconnected: 'Disconnection is one of the hardest feelings. You reached out, and that matters.',
    overwhelmed:  'Overwhelm passes, even when it doesn\'t feel like it will. You\'re not alone.',
    grateful:     'Gratitude is contagious. You just made someone else\'s day a little warmer.',
  };

  return res.json({
    communityMood,
    message: messages[mood] ?? 'Thank you for checking in today.',
  });
});
