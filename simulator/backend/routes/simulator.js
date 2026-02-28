import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Lazy init — ensures dotenv has already run before first request
let _openai = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API });
  return _openai;
}

// ─────────────────────────────────────────────────────────────
// POST /api/simulator/setup
// Takes a user's plain-English goal, returns a scenario + persona
// ─────────────────────────────────────────────────────────────
router.post('/setup', async (req, res) => {
  const { userInput } = req.body;
  if (!userInput) return res.status(400).json({ error: 'userInput is required' });

  const prompt = `You are a scenario designer for MindTrace Reality Simulator — a safe space where people practice emotionally difficult real-life conversations.

The user wants to practice: "${userInput}"

Design a realistic, emotionally nuanced scenario. Make the persona genuinely challenging but believable. Respond ONLY with valid JSON matching this exact structure:

{
  "scenario": {
    "title": "short evocative title (5 words max)",
    "description": "2-3 sentences setting the scene vividly",
    "setting": "physical or contextual setting (e.g., 'Your apartment kitchen', 'A work Slack call')",
    "stakes": "what's emotionally at risk (e.g., 'The friendship', 'Your boundaries', 'Your self-respect')",
    "difficulty": "Beginner | Intermediate | Advanced"
  },
  "persona": {
    "name": "realistic first name",
    "relationship": "their relationship to the user",
    "age": "a number like 29",
    "avatar": "a single fitting emoji representing them",
    "personality": ["3 to 4 personality traits — be specific and real, like 'guilt-trips without realizing it', 'deflects with humor'"],
    "backstory": "1-2 sentences explaining WHY they behave this way — make it humanizing",
    "currentMood": "their emotional state entering this conversation, one phrase",
    "communicationStyle": "how they talk — specific, e.g., 'turns everything into a joke when uncomfortable, then gets defensive if pushed'"
  },
  "openingMessage": "their very first message — realistic, natural, and in-character. Starts the situation.",
  "tips": ["2-3 short, specific tips for handling this conversation well"]
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.85,
    });
    const data = JSON.parse(completion.choices[0].message.content);
    res.json(data);
  } catch (err) {
    console.error('[SETUP ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/simulator/chat
// Continues the conversation in character, returns JSON with emotion
// ─────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { persona, scenario, history, userMessage } = req.body;

  const systemPrompt = `You are deeply embodying the character of ${persona.name} in a realistic conversation practice simulation.

CHARACTER PROFILE:
- Name: ${persona.name}
- Relationship to the user: ${persona.relationship}  
- Age: ${persona.age}
- Personality: ${persona.personality.join(', ')}
- Communication style: ${persona.communicationStyle}
- Backstory: ${persona.backstory}
- Starting mood: ${persona.currentMood}

CURRENT SITUATION: ${scenario.description}
Setting: ${scenario.setting}
What's at stake: ${scenario.stakes}

ROLEPLAY DIRECTIVES:
- Stay completely in character throughout — never break the fourth wall
- React authentically to the user's tone and assertiveness level
- If the user is passive or avoids the issue, gently take advantage of that (true to character)
- If the user is assertive but respectful, feel subtle pressure and begin to soften — gradually
- If the user is aggressive or accusatory, become defensive or shut down
- Do NOT resolve the conflict easily — this is practice, make them work for it
- Keep responses conversational, natural, and human (2–4 sentences usually)
- Show emotion through word choice and phrasing, not just labels
- Occasionally use filler words, ellipses, or incomplete thoughts to feel real

REQUIRED JSON OUTPUT FORMAT — respond ONLY with this structure:
{
  "message": "your in-character spoken response",
  "emotion": "one word from: defensive / hurt / guilty / frustrated / calm / confused / apologetic / resistant / warming / dismissive / vulnerable",
  "intensity": a decimal from 0.1 to 1.0 representing emotional intensity,
  "subtext": "one sentence: what ${persona.name} is ACTUALLY feeling but NOT saying aloud"
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.9,
    });
    const data = JSON.parse(completion.choices[0].message.content);
    res.json(data);
  } catch (err) {
    console.error('[CHAT ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/simulator/evaluate
// Analyzes the full conversation and returns coaching feedback
// ─────────────────────────────────────────────────────────────
router.post('/evaluate', async (req, res) => {
  const { persona, scenario, history } = req.body;

  const userMessages = history.filter(m => m.role === 'user');
  if (userMessages.length === 0) {
    return res.status(400).json({ error: 'No user messages to evaluate' });
  }

  const transcript = history
    .map((m, i) => `[${i + 1}] ${m.role === 'user' ? 'User' : persona.name}: ${m.content}`)
    .join('\n');

  const prompt = `You are an expert communication coach reviewing a practice conversation from MindTrace Reality Simulator.

SCENARIO: ${scenario.title}
SITUATION: ${scenario.description}
PERSONA: ${persona.name} (${persona.relationship}), traits: ${persona.personality.join(', ')}

FULL CONVERSATION TRANSCRIPT:
${transcript}

Analyze holistically and honestly. Be encouraging but truthful. Return ONLY valid JSON:

{
  "scores": {
    "assertiveness": {
      "score": 0 to 100,
      "label": "3-word label like 'Finding Your Voice'",
      "feedback": "2-3 sentences: specific, actionable, kind"
    },
    "empathy": {
      "score": 0 to 100,
      "label": "3-word label",
      "feedback": "2-3 sentences"
    },
    "clarity": {
      "score": 0 to 100,
      "label": "3-word label",
      "feedback": "2-3 sentences"
    }
  },
  "overallSummary": "2-3 sentences: warm, honest overall assessment",
  "keyMoments": [
    {
      "turn": message number from transcript (1-based),
      "speaker": "user or persona name",
      "type": "strength or weakness",
      "note": "brief specific observation about what happened here"
    }
  ],
  "betterResponses": [
    {
      "original": "exact user message text",
      "improved": "a better version of that message",
      "why": "one sentence: what makes the improved version better"
    }
  ],
  "growthAreas": ["2-3 specific, actionable things to work on"],
  "strengths": ["1-3 genuine things they did well — be specific"],
  "nextChallenge": "one sentence: what they should try next to level up"
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    const data = JSON.parse(completion.choices[0].message.content);
    res.json(data);
  } catch (err) {
    console.error('[EVALUATE ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/simulator/tts
// Converts AI response text to speech — returns audio/mpeg stream
// ─────────────────────────────────────────────────────────────
router.post('/tts', async (req, res) => {
  const { text, voice = 'nova' } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  try {
    const mp3 = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice,            // alloy | echo | fable | onyx | nova | shimmer
      input: text.slice(0, 400), // cap for speed
      speed: 1.0,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('[TTS ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/simulator/room-type
// Returns a room classification + voice for TTS based on scenario
// ─────────────────────────────────────────────────────────────
router.post('/room-type', async (req, res) => {
  const { setting, relationship } = req.body;
  const prompt = `Given this conversation setting: "${setting}" and relationship to the user: "${relationship}"

Choose the MOST fitting room type from this list:
- restaurant   : dining out, date, business lunch, romantic meal
- office        : workplace meeting, boss/manager, job review, colleague conflict
- living_room   : home conversation, family member, partner, housemate, close friend at home
- cafe          : casual coffee chat, friend catching up, neutral meeting spot
- bedroom       : very personal/intimate conversation, partner, late-night talk
- outdoors      : park, street, open-air, casual outdoor setting
- classroom     : teacher, professor, academic setting, school scenario
- therapy_room  : therapist, counselor, doctor, mental health professional
- hospital      : doctor, nurse, medical professional, clinical setting
- gym           : trainer, fitness coach, locker room, gym floor
- bar           : pub, bar, evening social, nightlife, unwinding
- kitchen       : home kitchen, family meal prep, domestic conversation

Also pick the best TTS voice for ${relationship}:
alloy=calm neutral, echo=deep thoughtful male, fable=warm storytelling British, onyx=authoritative commanding male, nova=warm friendly female, shimmer=soft gentle female

For a boss/manager: prefer onyx or echo. For therapist/doctor: prefer nova or fable. For friend: prefer alloy or nova. For partner: prefer nova or shimmer.

Respond ONLY with JSON: { "roomType": "...", "voice": "..." }`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch {
    res.json({ roomType: 'living_room', voice: 'nova' });
  }
});

export { router as simulatorRouter };
