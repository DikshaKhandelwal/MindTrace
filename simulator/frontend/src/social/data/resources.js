export const CRISIS_LINES = [
  {
    name: 'Suicide & Crisis Lifeline',
    text: 'Call or text 988',
    number: '988',
    region: 'United States — Available 24/7',
  },
  {
    name: 'Crisis Text Line',
    text: 'Text HOME to 741741',
    number: null,
    region: 'US · UK · Canada · Ireland · 24/7',
  },
  {
    name: 'Samaritans',
    text: 'Call 116 123',
    number: '116 123',
    region: 'UK & Ireland — Free, any time',
  },
  {
    name: 'Beyond Blue',
    text: 'Call 1300 22 4636',
    number: '1300 22 4636',
    region: 'Australia — 24 hours',
  },
];

export const BREATHING_STEPS = [
  { phase: 'Breathe in', duration: 4, colorClass: 'bg-teal-200',  textClass: 'text-teal-700'  },
  { phase: 'Hold',      duration: 4, colorClass: 'bg-amber-200', textClass: 'text-amber-700' },
  { phase: 'Breathe out', duration: 6, colorClass: 'bg-blue-200',  textClass: 'text-blue-700'  },
  { phase: 'Hold',      duration: 2, colorClass: 'bg-stone-200', textClass: 'text-stone-500' },
];

export const ARTICLES = [
  {
    id: 'a1',
    title: 'Understanding Your Anxiety Response',
    category: 'anxiety',
    readTime: '5 min',
    summary:
      'How your nervous system creates the anxiety state — and why that\'s actually useful information for working with it instead of against it.',
  },
  {
    id: 'a2',
    title: 'The Five Stages of Grief Are a Lie',
    category: 'grief',
    readTime: '7 min',
    summary:
      "Why grief isn't linear, why the stages model does more harm than good, and what actually helps when you're inside it.",
  },
  {
    id: 'a3',
    title: 'Burnout Is Not Laziness',
    category: 'burnout',
    readTime: '6 min',
    summary:
      'The neuroscience of burnout and why willpower is entirely the wrong tool to fight it — what actually helps recovery.',
  },
  {
    id: 'a4',
    title: 'Holding Limits Without Guilt',
    category: 'relationships',
    readTime: '8 min',
    summary:
      'Why holding your own limits feels selfish when it isn\'t — and the one reframe that makes them easier to keep.',
  },
  {
    id: 'a5',
    title: 'What Depression Actually Feels Like',
    category: 'depression',
    readTime: '5 min',
    summary:
      'Moving beyond sadness to understand depression\'s many faces — the flat days, the grey fog, the invisible weight.',
  },
  {
    id: 'a6',
    title: 'When Everything Feels Too Hard',
    category: 'depression',
    readTime: '4 min',
    summary:
      'A grounding toolkit for the nights when existing feels like too much. Small anchors for hard moments.',
  },
  {
    id: 'a7',
    title: 'The Skill of Being Uncomfortable',
    category: 'growth',
    readTime: '6 min',
    summary:
      'What psychological flexibility actually means in practice — and how to build a slightly larger tolerance for difficulty.',
  },
  {
    id: 'a8',
    title: 'New Place, New You? Not Quite',
    category: 'transitions',
    readTime: '5 min',
    summary:
      'Why major life changes take longer than you think to feel okay about — and what to expect in the in-between.',
  },
  {
    id: 'a9',
    title: 'The Pressure to Be High-Functioning',
    category: 'student',
    readTime: '6 min',
    summary:
      'Why high achievement and struggling emotionally aren\'t opposites — and what gets lost when we only celebrate output.',
  },
];

export const GROUNDING_STEPS = [
  { number: 5, sense: 'See',   prompt: 'Notice 5 things you can see right now' },
  { number: 4, sense: 'Touch', prompt: 'Notice 4 things you can physically feel' },
  { number: 3, sense: 'Hear',  prompt: 'Notice 3 sounds in your environment' },
  { number: 2, sense: 'Smell', prompt: 'Notice 2 things you can smell (or recall a scent)' },
  { number: 1, sense: 'Taste', prompt: 'Notice 1 thing you can taste right now' },
];
