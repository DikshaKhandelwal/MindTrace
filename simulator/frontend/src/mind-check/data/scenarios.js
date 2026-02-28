/**
 * 10 scenario vignettes. Each choice maps to signal weights.
 * Signals: tension, disconnection, fatigue, rumination, meaning
 * Higher total signal score = more likely to need external support.
 */

export const SCENARIOS = [
  {
    id: 1,
    title: 'Sunday, 7 p.m.',
    situation: "Tomorrow is Monday. You've done nothing today. It's quiet.",
    choices: [
      {
        text: 'Fine. Rest is rest.',
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: 'A low background hum of dread.',
        signals: { tension: 2, disconnection: 0, fatigue: 0, rumination: 1, meaning: 0 },
      },
      {
        text: "Something like dread, but I can't even name what I'm dreading.",
        signals: { tension: 3, disconnection: 1, fatigue: 0, rumination: 2, meaning: 1 },
      },
    ],
  },
  {
    id: 2,
    title: 'Someone asks "How are you?"',
    situation: 'A friend — someone who actually cares — asks how you\'ve been.',
    choices: [
      {
        text: 'I tell them. Normal stuff.',
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "I say 'good' and change the subject.",
        signals: { tension: 1, disconnection: 2, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "I genuinely don't know what to say.",
        signals: { tension: 1, disconnection: 3, fatigue: 1, rumination: 0, meaning: 2 },
      },
    ],
  },
  {
    id: 3,
    title: 'The alarm goes off.',
    situation: "It's morning. You've slept. The day hasn't started yet.",
    choices: [
      {
        text: "It's just morning. I get up.",
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: 'I stay for a few minutes. Reluctant.',
        signals: { tension: 0, disconnection: 0, fatigue: 2, rumination: 0, meaning: 1 },
      },
      {
        text: 'The thought of the day feels like weight.',
        signals: { tension: 2, disconnection: 1, fatigue: 3, rumination: 0, meaning: 2 },
      },
    ],
  },
  {
    id: 4,
    title: 'A free afternoon.',
    situation: "Nothing is scheduled. You have three hours that are entirely yours.",
    choices: [
      {
        text: "I know what I'll do. I enjoy it.",
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "I scroll for a while, then do something.",
        signals: { tension: 0, disconnection: 1, fatigue: 1, rumination: 0, meaning: 0 },
      },
      {
        text: "I can't figure out what I want. The time passes.",
        signals: { tension: 1, disconnection: 2, fatigue: 1, rumination: 1, meaning: 3 },
      },
    ],
  },
  {
    id: 5,
    title: 'Something good happens.',
    situation: 'You receive genuinely good news. Something you\'d wanted.',
    choices: [
      {
        text: "I feel good. Properly.",
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "Brief relief, then back to normal quickly.",
        signals: { tension: 0, disconnection: 1, fatigue: 0, rumination: 1, meaning: 1 },
      },
      {
        text: "I notice the good news but don't really feel it.",
        signals: { tension: 0, disconnection: 3, fatigue: 1, rumination: 0, meaning: 3 },
      },
    ],
  },
  {
    id: 6,
    title: 'Someone criticises your work.',
    situation: 'A reasonable critique. It has some truth in it. You know that.',
    choices: [
      {
        text: "I take it in, think about it, move on.",
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "I agree out loud, but it stays with me longer than it should.",
        signals: { tension: 1, disconnection: 0, fatigue: 0, rumination: 2, meaning: 0 },
      },
      {
        text: "It confirms something I was already afraid about myself.",
        signals: { tension: 2, disconnection: 1, fatigue: 0, rumination: 3, meaning: 2 },
      },
    ],
  },
  {
    id: 7,
    title: 'Six months from now.',
    situation: 'You picture your life in six months. Honestly.',
    choices: [
      {
        text: "I see something I'm working toward.",
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "Mostly the same. Not sure if that's okay.",
        signals: { tension: 0, disconnection: 1, fatigue: 1, rumination: 0, meaning: 2 },
      },
      {
        text: "I can't really picture it. Or I don't want to.",
        signals: { tension: 2, disconnection: 2, fatigue: 1, rumination: 1, meaning: 3 },
      },
    ],
  },
  {
    id: 8,
    title: "Sleep this week.",
    situation: "Think about how you've slept over the last seven days.",
    choices: [
      {
        text: "Reasonably. Nothing unusual.",
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "Patchy. Tired more than usual.",
        signals: { tension: 1, disconnection: 0, fatigue: 2, rumination: 0, meaning: 0 },
      },
      {
        text: "Either too much or not enough. Neither feels restoring.",
        signals: { tension: 2, disconnection: 1, fatigue: 3, rumination: 1, meaning: 0 },
      },
    ],
  },
  {
    id: 9,
    title: "Mid-conversation.",
    situation: "Someone is talking. You realise you've been somewhere else entirely.",
    choices: [
      {
        text: "It happens occasionally. I come back.",
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "More often than I'd like.",
        signals: { tension: 1, disconnection: 1, fatigue: 1, rumination: 1, meaning: 0 },
      },
      {
        text: "I'm rarely fully present anywhere lately.",
        signals: { tension: 1, disconnection: 3, fatigue: 2, rumination: 2, meaning: 1 },
      },
    ],
  },
  {
    id: 10,
    title: 'Right now.',
    situation: "Before you leave this — honestly. How are you?",
    choices: [
      {
        text: "Okay. Genuinely.",
        signals: { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 },
      },
      {
        text: "I've been better. I'm managing.",
        signals: { tension: 1, disconnection: 1, fatigue: 1, rumination: 1, meaning: 1 },
      },
      {
        text: "Not great. And I don't always know why.",
        signals: { tension: 2, disconnection: 2, fatigue: 2, rumination: 2, meaning: 2 },
      },
    ],
  },
];

/**
 * Score the collected answers and return a result object.
 * @param {number[]} picks  — array of choice indices (0|1|2) per scenario
 * @returns {{ level: 'low'|'medium'|'high', totalScore: number, signals: object }}
 */
export function scoreAnswers(picks) {
  const signals = { tension: 0, disconnection: 0, fatigue: 0, rumination: 0, meaning: 0 };

  picks.forEach((pick, i) => {
    const s = SCENARIOS[i]?.choices[pick]?.signals;
    if (!s) return;
    Object.keys(signals).forEach(k => { signals[k] += s[k] ?? 0; });
  });

  const total = Object.values(signals).reduce((a, b) => a + b, 0);

  const level = total <= 6 ? 'low' : total <= 13 ? 'medium' : 'high';

  const dominant = Object.entries(signals).sort((a, b) => b[1] - a[1]).map(([k]) => k);

  return { level, totalScore: total, signals, dominant };
}
