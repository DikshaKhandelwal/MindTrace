import express from 'express';
import OpenAI from 'openai';

export const mindCafeRouter = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/mindcafe/hint
// Given a customer's dialogue lines, suggest which 2-3 emotional ingredients they need
mindCafeRouter.post('/hint', async (req, res) => {
  const { dialogue, role } = req.body;
  if (!dialogue) return res.status(400).json({ error: 'dialogue required' });

  const VALID = ['calm','energy','kindness','quiet','reassurance','release','connection','warmth'];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a barista who reads emotional states. Given a customer's words, pick 2-3 emotional ingredients they need most.
Valid ingredients: ${VALID.join(', ')}.
Return JSON: { "ingredients": ["id1","id2"], "reason": "one short sentence why" }`,
        },
        {
          role: 'user',
          content: `Customer role: ${role}\nDialogue: "${dialogue}"`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    // sanitize
    parsed.ingredients = (parsed.ingredients || []).filter(i => VALID.includes(i)).slice(0, 3);
    res.json(parsed);
  } catch (err) {
    console.error('mindcafe hint error', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mindcafe/reaction
// Given score and brew name, generate a unique customer reaction line
mindCafeRouter.post('/reaction', async (req, res) => {
  const { score, brewName, customerName, customerRole } = req.body;

  const tone = score >= 0.8 ? 'deeply moved and understood' :
               score >= 0.5 ? 'slightly soothed but still holding something' :
               'politely disappointed, still carrying their weight';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 80,
      messages: [
        {
          role: 'system',
          content: 'You write one-sentence emotional reactions for a cozy café game. Keep it under 20 words. No quotes. Pure feeling.',
        },
        {
          role: 'user',
          content: `${customerName} (${customerRole}) receives "${brewName}". They feel ${tone}. Write their reaction.`,
        },
      ],
    });

    res.json({ reaction: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('mindcafe reaction error', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mindcafe/spill
// Given raw thoughts dumped into the "spill machine", return a gentle reframe
mindCafeRouter.post('/spill', async (req, res) => {
  const { thoughts } = req.body;
  if (!thoughts) return res.status(400).json({ error: 'thoughts required' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content: `You're a gentle presence in a cozy café. Someone just poured their raw thoughts into you.
Respond with 2 sentences: one that acknowledges what they're feeling (no toxic positivity), and one that gently reframes or offers perspective. Warm, honest, brief.`,
        },
        { role: 'user', content: thoughts },
      ],
    });

    res.json({ response: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('mindcafe spill error', err.message);
    res.status(500).json({ error: err.message });
  }
});
