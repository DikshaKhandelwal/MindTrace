import express from 'express';
import OpenAI from 'openai';

export const mindCafeRouter = express.Router();

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// POST /api/mindcafe/generate
// Generate a customer's entry hint and 3 dialogue lines dynamically
mindCafeRouter.post('/generate', async (req, res) => {
  const { name, role, hint: seedHint, isNight, needs } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  // Build a sensory drink description to guide GPT's third dialogue line
  const drinkDesc = needs ? [
    needs.strength && needs.strength !== 'single' ? `${needs.strength}-shot` : '',
    needs.milk && needs.milk !== 'black' ? `${needs.milk} milk` : needs.milk === 'black' ? 'black (no milk)' : '',
    needs.base ? needs.base.replace('_', ' ') : '',
    needs.sweet && needs.sweet !== 'none' ? `with ${needs.sweet}` : '',
    needs.finish && needs.finish !== 'plain' ? `topped with ${needs.finish}` : '',
  ].filter(Boolean).join(' ') : '';

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 320,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You write intimate, minimal dialogue for a cozy mental-health café game.
A customer arrives. Write:
- hint: one observational sentence describing how they look/act as they arrive (barista's eyes, present tense, poetic but grounded, under 25 words)
- dialogues: array of exactly 3 lines the customer says, in order. Each is 1-2 sentences. Honest, quiet, emotionally real. No therapy-speak. No toxic positivity.
${drinkDesc ? `The third line must subtly hint what kind of drink they need ("${drinkDesc}") using emotion/sensation — never name the drink directly. E.g. "Something gentle today. Nothing loud." or "Strong. Just strong." or "Something warm and a little sweet wouldn't hurt."` : ''}
${isNight ? 'It is late night — heavier, more tired, more vulnerable.' : ''}
Return JSON: { "hint": "...", "dialogues": ["...", "...", "..."] }`,
        },
        {
          role: 'user',
          content: `Customer: ${name} — ${role}\nSeed: ${seedHint}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    if (!Array.isArray(parsed.dialogues) || parsed.dialogues.length < 3) {
      throw new Error('Invalid dialogue format');
    }
    res.json({ hint: parsed.hint, dialogues: parsed.dialogues.slice(0, 3) });
  } catch (err) {
    console.error('mindcafe generate error', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mindcafe/reaction
// Generate a unique customer reaction line knowing their dialogue + the exact drink + match quality
mindCafeRouter.post('/reaction', async (req, res) => {
  const { score, brewName, customerName, customerRole, lastDialogue } = req.body;

  const tone = score >= 0.60 ? 'deeply understood — this is exactly what they needed'
             : score >= 0.40 ? 'mostly right, quietly grateful but still a little unsettled'
             : score >= 0.25 ? 'politely sipping something that misses the mark'
             : 'gently disappointed, still carrying what they came with';

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 60,
      messages: [
        {
          role: 'system',
          content: 'You write one single sentence (under 18 words) of what a café customer says or feels after receiving their drink. Quiet, real, no clichés. No quotes.',
        },
        {
          role: 'user',
          content: `${customerName} (${customerRole}) just said: "${lastDialogue}"\nThey receive: ${brewName}\nThey feel: ${tone}`,
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
    const openai = getOpenAI();
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
