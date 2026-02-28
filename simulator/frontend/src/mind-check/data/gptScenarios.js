/**
 * gptScenarios.js
 * Generates 10 personalised scenario vignettes from the user's freeform context.
 * Falls back to the static scenarios if no API key is present.
 */
import { SCENARIOS, scoreAnswers } from './scenarios';

const API   = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

function key() { return import.meta.env.VITE_OPENAI_KEY || ''; }

const SYSTEM = `You write short psychological scenario vignettes for a personal reflection tool.
Given a brief personal context, generate exactly 6 scenario vignettes that feel lightly tailored to it — without naming any problem directly or using clinical language.

JSON schema for each scenario (return a bare JSON array, no wrapper):
{
  "title": "3-5 word evocative heading",
  "situation": "1 sentence, second-person, sensory scene — NOT a question",
  "choices": [
    { "text": "one short first-person reaction", "signals": { "tension":0, "disconnection":0, "fatigue":0, "rumination":0, "meaning":0 } },
    { "text": "...", "signals": { "tension":1, "disconnection":1, "fatigue":1, "rumination":1, "meaning":1 } },
    { "text": "...", "signals": { "tension":2, "disconnection":2, "fatigue":2, "rumination":2, "meaning":2 } }
  ]
}

Signal values 0-3. Choice 0 = healthy (all ≤1). Choice 1 = moderate (1-2). Choice 2 = highest (2-3).
Return ONLY the JSON array. No markdown, no commentary.`;

/**
 * @param {string} userContext — the freeform text from the user
 * @returns {Promise<Array>} — array of 10 scenario objects matching the static format
 */
function fallback() {
  return [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 6).map((s, i) => ({ ...s, id: i + 1 }));
}

export async function generateScenarios(userContext) {
  if (!key()) return fallback();

  // 8-second timeout — fall back to static if GPT is slow
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 25000));

  try {
    const res = await Promise.race([fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key()}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user',   content: `User context:\n"${userContext.trim()}"` },
        ],
        temperature: 0.75,
        max_tokens:  1100,
        response_format: { type: 'json_object' },
      }),
    }), timeout]);

    if (!res.ok) throw new Error('api-fail');
    const data = await res.json();
    const raw  = JSON.parse(data.choices[0].message.content);

    // Support either { scenarios: [...] } or a bare array
    const arr = Array.isArray(raw) ? raw : raw.scenarios ?? raw.vignettes ?? Object.values(raw)[0];

    if (!Array.isArray(arr) || arr.length < 5) throw new Error('bad-shape');

    // Normalise — ensure every choice has a signals object
    return arr.slice(0, 6).map((s, i) => ({
      id:       i + 1,
      title:    s.title    ?? `Moment ${i + 1}`,
      situation:s.situation ?? '',
      choices:  (s.choices ?? []).map(c => ({
        text:    c.text ?? '',
        signals: {
          tension:       Number(c.signals?.tension       ?? 0),
          disconnection: Number(c.signals?.disconnection ?? 0),
          fatigue:       Number(c.signals?.fatigue       ?? 0),
          rumination:    Number(c.signals?.rumination    ?? 0),
          meaning:       Number(c.signals?.meaning       ?? 0),
        },
      })),
    }));
  } catch {
    return fallback();
  }
}

export { scoreAnswers };
