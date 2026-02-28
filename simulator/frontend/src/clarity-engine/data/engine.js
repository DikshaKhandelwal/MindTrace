// ─── Node Types ───────────────────────────────────────────────────────────────
export const NODE_TYPES = {
  core:     { label: 'Core Decision',      emoji: '⚡', color: '#f472b6', bg: 'rgba(244,114,182,0.22)', ring: 'rgba(244,114,182,0.55)', size: 58 },
  fear:     { label: 'Fear',               emoji: '🌸', color: '#fda4af', bg: 'rgba(253,164,175,0.20)', ring: 'rgba(253,164,175,0.55)', size: 44 },
  logic:    { label: 'Logic',              emoji: '💙', color: '#93c5fd', bg: 'rgba(147,197,253,0.20)', ring: 'rgba(147,197,253,0.55)', size: 40 },
  opp:      { label: 'Opportunity',        emoji: '🌿', color: '#86efac', bg: 'rgba(134,239,172,0.20)', ring: 'rgba(134,239,172,0.55)', size: 40 },
  unknown:  { label: 'Unknown',            emoji: '✨', color: '#fde68a', bg: 'rgba(253,230,138,0.20)', ring: 'rgba(253,230,138,0.55)', size: 38 },
  pressure: { label: 'External Pressure',  emoji: '🔮', color: '#c4b5fd', bg: 'rgba(196,181,253,0.20)', ring: 'rgba(196,181,253,0.55)', size: 38 },
  past:     { label: 'Past Experience',    emoji: '🍑', color: '#fdba74', bg: 'rgba(253,186,116,0.20)', ring: 'rgba(253,186,116,0.55)', size: 38 },
};

// ─── Bias Library ─────────────────────────────────────────────────────────────
export const BIAS_LIBRARY = {
  catastrophizing: {
    label: 'Catastrophizing',
    desc: "You're imagining the worst case as the most probable outcome.",
    tip: 'Ask: what is the realistic probability of the worst case?',
    color: '#fda4af',
    patterns: ['worst', 'terrible', 'disaster', 'ruin', 'destroy', 'lose everything', 'never recover', 'all go wrong', 'end up', 'no way out', 'too late', 'spiral'],
  },
  overgeneralization: {
    label: 'Overgeneralization',
    desc: "You're applying one outcome to all possible futures.",
    tip: 'Ask: is this always true, or just sometimes?',
    color: '#c4b5fd',
    patterns: ['always', 'never', 'everyone', 'nobody', 'nothing ever', 'every time', 'every single', 'all the time', 'nothing works'],
  },
  fearBias: {
    label: 'Fear-Driven Reasoning',
    desc: "Emotions are dominating factual analysis in your thinking.",
    tip: 'Separate: what do I feel vs. what do I factually know?',
    color: '#f9a8d4',
    patterns: ['scared', 'afraid', 'terrified', 'paralyzing', 'dread', 'panic', 'fear', 'frightened', 'horror', 'overwhelmed'],
  },
  socialPressure: {
    label: 'Social Pressure Bias',
    desc: "Others' opinions are influencing your decision more than your own values.",
    tip: 'Ask: what would I choose if no one was watching?',
    color: '#a5f3fc',
    patterns: ['what will they think', 'people expect', 'everyone thinks', 'they want', 'should according to', 'family wants', 'society', 'reputation', 'judged', 'embarrass'],
  },
  mindsReading: {
    label: 'Mind Reading',
    desc: "You're assuming you know what others think or will do.",
    tip: 'Ask: have they actually expressed this, or am I guessing?',
    color: '#fde68a',
    patterns: ["they'll think", "they'll judge", "they won't", "they'll see", "people will say", "they already know", "everyone knows"],
  },
  sunkCost: {
    label: 'Sunk Cost Fallacy',
    desc: "Past investment is driving future decisions rather than future value.",
    tip: 'Ask: would the past effort justify this if I started fresh today?',
    color: '#fdba74',
    patterns: ["can't leave now", 'already invested', 'wasted years', 'come too far', 'put in so much', 'can\'t walk away', 'after all this time'],
  },
};

// ─── Reframe Templates ────────────────────────────────────────────────────────
export const REFRAMES = [
  { trigger: ["what if i fail",  "might fail", "could fail", "going to fail"],           reframe: "What if this becomes the experience that teaches you the most?" },
  { trigger: ["regret",          "will regret", "going to regret"],                       reframe: "Which choice will future-you be more proud of attempting?" },
  { trigger: ["not good enough", "not ready",   "not qualified"],                         reframe: "You don't need to be perfect to begin — you grow by doing." },
  { trigger: ["too risky",       "so risky",    "huge risk"],                             reframe: "What is the cost of the risk of staying exactly where you are?" },
  { trigger: ["what will they",  "people think","what if they judge"],                    reframe: "In 5 years, will their opinion matter as much as your own?" },
  { trigger: ["no guarantee",    "don't know",  "uncertain", "no certainty"],             reframe: "Uncertainty means the positive outcome is equally possible." },
  { trigger: ["already tried",   "tried before","didn't work before"],                   reframe: "Past attempts gave you data. You know more now than you did then." },
  { trigger: ["too late",        "should have", "missed my chance"],                      reframe: "The best time to act is always the moment you're ready." },
  { trigger: ["stuck",           "going nowhere","trapped", "no options"],                reframe: "Feeling stuck means you're between chapters, not at the end." },
  { trigger: ["overwhelmed",     "too much",    "can't handle"],                          reframe: "You don't have to solve everything — just the next smallest step." },
];

// ─── Text Parser ──────────────────────────────────────────────────────────────
const FEAR_KW     = ['scared','afraid','worried','anxious','fear','regret','fail','terrible','worst','never','lose','ruin','mistake','wrong','doubt','nervous','hesitant','dread','panic','risk','danger','bad'];
const LOGIC_KW    = ['because','since','fact','know','data','experience','evidence','proven','results','skill','trained','actually','objectively','realistically','research','analysis','track record'];
const OPP_KW      = ['could','might','opportunity','chance','grow','learn','new','better','improve','potential','try','explore','discover','build','flourish','possible','open','positive','upside','gain'];
const UNKNOWN_KW  = ["don't know",'uncertain','unclear','maybe','perhaps','wonder','question','figure out',"not sure",'unclear','unsure','ambiguous','no idea'];
const PRESSURE_KW = ['should','expect','everyone','society','family','friends','they want','told me','people think','reputation','judgment','supposed to','have to because','pressure','others want'];
const PAST_KW     = ['before','last time','previously','used to','past','tried','failed before','succeeded before','when i was','back then','historically','same as before','remember when'];

function extractPhraseAround(text, keyword, windowSize = 6) {
  const words = text.toLowerCase().split(/\s+/);
  const idx = words.findIndex(w => w.includes(keyword.replace(/\s+/g, '').slice(0, 5)));
  if (idx === -1) return null;
  const start = Math.max(0, idx - 2);
  const end   = Math.min(words.length, idx + windowSize);
  return words.slice(start, end).join(' ');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function parseThought(rawText) {
  const text = rawText.toLowerCase();
  const nodes = [];
  let id = 0;

  // Core decision — extract first sentence or first 8 words
  const firstSentence = rawText.split(/[.!?]/)[0].trim();
  const coreLabel = firstSentence.split(/\s+/).slice(0, 7).join(' ');
  nodes.push({ id: id++, type: 'core', label: capitalize(coreLabel), weight: 3 });

  // Helper — avoid duplicate labels
  const labels = new Set([coreLabel.toLowerCase()]);

  function addNode(type, kws) {
    for (const kw of kws) {
      if (text.includes(kw)) {
        const phrase = extractPhraseAround(text, kw, 5);
        if (phrase && !labels.has(phrase)) {
          labels.add(phrase);
          nodes.push({ id: id++, type, label: capitalize(phrase), weight: type === 'fear' ? 2 : 1 });
        }
        if (nodes.filter(n => n.type === type).length >= 4) break;
      }
    }
  }

  addNode('fear',     FEAR_KW);
  addNode('logic',    LOGIC_KW);
  addNode('opp',      OPP_KW);
  addNode('unknown',  UNKNOWN_KW);
  addNode('pressure', PRESSURE_KW);
  addNode('past',     PAST_KW);

  // Ensure at least a few nodes for a sparse entry
  if (nodes.length < 3) {
    nodes.push({ id: id++, type: 'unknown', label: 'Unanswered questions', weight: 1 });
    nodes.push({ id: id++, type: 'fear',    label: 'Underlying concern',   weight: 2 });
    nodes.push({ id: id++, type: 'opp',     label: 'Positive possibility', weight: 1 });
  }

  return nodes;
}

// ─── Fear Percentage ──────────────────────────────────────────────────────────
export function getFearPercent(nodes) {
  const total = nodes.filter(n => n.type !== 'core').length || 1;
  const fearCount = nodes.filter(n => n.type === 'fear').length;
  const pressureCount = nodes.filter(n => n.type === 'pressure').length;
  return Math.round(((fearCount * 1.5 + pressureCount * 0.8) / (total * 1.5)) * 100);
}

// ─── Loop Detection ───────────────────────────────────────────────────────────
// Loop types and their full break protocols
const LOOP_TYPES = {
  amplification: {
    label: 'Fear Amplification Loop',
    emoji: '🔥',
    tagline: 'Each fear feeds the next, growing larger each cycle.',
    rootAssumption: "The worst case is almost certain to happen AND you won't be able to handle it.",
    steps: [
      { icon: '🔍', title: 'Reality-test the probability', action: 'Think of the last 3 times you feared something comparable. How many actually happened? Most fears rate 2–3 out of 10 in actual probability.' },
      { icon: '💪', title: 'Survivability check', action: 'Even if the worst case happened — what resources do you have? Resilience, people, skills, time? You have survived hard things before.' },
      { icon: '🧪', title: 'Find one piece of counter-evidence', action: 'Name one real example (from your life or someone you know) where this type of fear turned out to be unfounded or manageable.' },
      { icon: '⚡', title: 'Act within 48 hours', action: 'Loops break through action, not more thinking. Pick the smallest possible step forward you can take in the next 48 hours. That\'s it — just one step.' },
    ],
  },
  uncertainty: {
    label: 'Uncertainty Spiral',
    emoji: '🌀',
    tagline: 'Unanswered questions generate anxiety, which generates more questions.',
    rootAssumption: "You need certainty before you can act. Uncertainty itself is dangerous.",
    steps: [
      { icon: '📦', title: 'Separate known from unknown', action: 'Write two columns: what you KNOW for certain vs what you DON\'T KNOW. Direct attention only at the "known" column for now.' },
      { icon: '🔎', title: 'Classify each unknown', action: 'For each unknown: mark it "findable" (can research in 24h) or "inherently uncertain" (unknowable until you act). Stop trying to resolve the inherently uncertain ones — that\'s where the loop lives.' },
      { icon: '📅', title: 'Set a data deadline', action: 'Choose one "findable" unknown you can resolve today or tomorrow. Go get that one piece of information. Partial clarity is enough to move.' },
      { icon: '🤲', title: 'Accept the unknowable', action: 'Remind yourself: every meaningful decision in human history was made under uncertainty. The discomfort you feel is not a warning — it\'s the normal texture of growth.' },
    ],
  },
  social: {
    label: 'Social Pressure Loop',
    emoji: '👥',
    tagline: 'Others\' opinions are circling back as your own thoughts.',
    rootAssumption: "Other people's approval is required for your choice to be valid.",
    steps: [
      { icon: '🤫', title: 'The secret test', action: 'If absolutely nobody in your life would ever know which choice you made — what would you choose? That answer is yours, uncorrupted.' },
      { icon: '🪞', title: 'Source check', action: 'Whose voice is loudest in your head right now? Is this person living the life you actually aspire to? If not, their opinion is data, not authority.' },
      { icon: '⏳', title: 'Time-collapse the judgment', action: 'In 6 months, how many people will still be actively thinking about this decision? The social jury disperses far faster than it feels right now.' },
      { icon: '🧭', title: 'Values anchor', action: 'Finish this sentence out loud: "I want to make this choice because I believe in ___, not because ___ expects it of me." That\'s your compass.' },
    ],
  },
  selfDoubt: {
    label: 'Self-Doubt Loop',
    emoji: '🌫️',
    tagline: 'Past experiences are being used as permanent proof of future failure.',
    rootAssumption: "Your past performance permanently defines your capability now.",
    steps: [
      { icon: '📋', title: 'Evidence audit', action: 'List 3 things you\'ve figured out or improved at DESPITE not knowing how at first. You have a track record of learning — use it as your baseline, not your worst moment.' },
      { icon: '🔬', title: 'Same vs similar', action: 'Is this truly the same situation as the past, or just a similar category? What\'s actually different now: your age, experience, knowledge, support, resources?' },
      { icon: '🧫', title: 'Minimum disproof experiment', action: 'What\'s the smallest possible attempt that could prove the fear wrong? Not the full commitment — just a tiny test that gives you real (not imagined) data.' },
      { icon: '🎒', title: 'Resource inventory', action: 'Write what you have today that you did NOT have when the past thing went wrong: skills, relationships, money, perspective, knowledge. You are not who you were then.' },
    ],
  },
};

// ── Text pattern banks for each loop type ────────────────────────────────────
const LOOP_PATTERNS = {
  amplification: {
    // Escalation chains: "what if X → then Y → then even worse Z"
    triggers: [
      'what if',
      'and then',
      'which means',
      'which would mean',
      'would lead to',
      'that would cause',
      'ends up',
      'spirals',
      'even worse',
      'and what if',
      'worst case',
      'lose everything',
      'ruins everything',
      'everything falls apart',
      'can\'t recover',
      'no coming back',
      'downward spiral',
    ],
    // Must also have at least one fear signal
    fearSignals: ['afraid', 'scared', 'worried', 'terrified', 'panic', 'dread', 'fear', 'anxious', 'nervous'],
    minScore: 3, // need 3+ trigger hits
    // Extract chains: sentences that contain escalation language
    extractChain: (sentences, lower) => {
      const escalators = ['what if', 'and then', 'which means', 'which would mean', 'would lead', 'ends up', 'worst case', 'even worse', 'and if'];
      const matches = sentences.filter(s =>
        escalators.some(e => s.toLowerCase().includes(e)) ||
        LOOP_PATTERNS.amplification.fearSignals.some(f => s.toLowerCase().includes(f))
      ).slice(0, 2);
      if (matches.length >= 2) {
        return [
          trim6(matches[0]),
          '→',
          trim6(matches[1]),
          '→',
          'Back to the first fear',
          '🔁',
        ];
      }
      if (matches.length === 1) {
        return [trim6(matches[0]), '→', 'Catastrophe imagined', '→', 'Back to start', '🔁'];
      }
      return null;
    },
  },

  uncertainty: {
    // Cycling through unknowns: "I don't know → anxiety → more unknowns"
    triggers: [
      "don't know",
      "not sure",
      "not certain",
      "no idea",
      "can't tell",
      "can't predict",
      "unclear",
      'unsure',
      'uncertain',
      'maybe',
      'perhaps',
      'might be',
      'could be wrong',
      'hard to say',
      'no way to know',
      'what will happen',
      'who knows',
    ],
    fearSignals: ['worried', 'anxious', 'scared', 'fear', 'dread', 'nervous', 'uneasy', 'stressed'],
    minScore: 4, // needs 4+ unknowns + at least 1 fear signal
    extractChain: (sentences, lower) => {
      const unknownSignals = ["don't know", "not sure", "uncertain", "unclear", "no idea", "can't predict", "maybe", "might"];
      const matches = sentences.filter(s =>
        unknownSignals.some(u => s.toLowerCase().includes(u))
      ).slice(0, 2);
      if (matches.length >= 2) {
        return [trim6(matches[0]), '→', 'Anxiety from not knowing', '→', trim6(matches[1]), '→', 'More uncertainty', '🔁'];
      }
      if (matches.length === 1) {
        return [trim6(matches[0]), '→', 'Anxiety rises', '→', 'New unknowns surface', '🔁'];
      }
      return null;
    },
  },

  social: {
    // People-pleasing loop: "what will they think → I should → but I want → guilt"
    triggers: [
      'what will they',
      'what would they',
      'what will people',
      'what would people',
      'people will think',
      'everyone will think',
      'they will judge',
      'judged',
      'disappoint',
      'let them down',
      'expectations',
      'they expect',
      'supposed to',
      'others want',
      'they want me to',
      'family wants',
      'everyone expects',
      'what they think',
      'opinion of me',
      'looks bad',
    ],
    fearSignals: ['afraid', 'scared', 'worried', 'fear', 'dread', 'anxious'],
    minScore: 2, // social loops are easy to spot
    extractChain: (sentences, lower) => {
      const socialSignals = ['what will', 'what would', 'think of me', 'they think', 'expect', 'disappoint', 'judge', 'opinion', 'they want', 'family', 'everyone'];
      const matches = sentences.filter(s =>
        socialSignals.some(sig => s.toLowerCase().includes(sig))
      ).slice(0, 2);
      if (matches.length >= 2) {
        return [trim6(matches[0]), '→', 'I should meet expectations', '→', trim6(matches[1]) + ' (but I want something else)', '→', 'Guilt & conflict', '🔁'];
      }
      return ['What will they think?', '→', 'I have to satisfy them', '→', 'But what about what I want?', '→', 'Back to judgment fear', '🔁'];
    },
  },

  selfDoubt: {
    // Past failure as permanent proof
    triggers: [
      'last time',
      'before i',
      'when i tried',
      'failed before',
      'didn\'t work',
      'didn\'t work out',
      'never works',
      'always happens',
      'same thing',
      'happens to me',
      'just like before',
      'again like',
      'happened again',
      'remember when',
      'just like when',
      'back then',
      'previous time',
    ],
    fearSignals: ['afraid', 'scared', 'worried', 'fear', 'doubt', 'probably will', 'will fail', "won't work", 'going to fail', 'not capable', 'not good enough'],
    minScore: 2,
    extractChain: (sentences, lower) => {
      const pastSignals = ['last time', 'before', 'failed', 'didn\'t work', 'tried', 'remember when', 'same', 'always happens', 'back then'];
      const fearSignals = ['afraid', 'scared', 'worried', 'fear', 'doubt', 'will fail', "won't work", 'fail again', 'not capable', 'not good enough'];
      const pastMatch = sentences.find(s => pastSignals.some(p => s.toLowerCase().includes(p)));
      const fearMatch = sentences.find(s => fearSignals.some(f => s.toLowerCase().includes(f)));
      if (pastMatch && fearMatch) {
        return [trim6(pastMatch), '→', "I'm not capable enough", '→', trim6(fearMatch), '→', 'The past confirms the fear', '🔁'];
      }
      if (pastMatch) {
        return [trim6(pastMatch), '→', 'Doubt in my own ability', '→', 'Expecting the same result', '🔁'];
      }
      return null;
    },
  },
};

// Trim a sentence to ~6 words for display in the chain
function trim6(s) {
  if (!s) return '';
  const words = s.trim().split(/\s+/);
  return capitalize(words.slice(0, 6).join(' ') + (words.length > 6 ? '…' : ''));
}

export function detectLoop(nodes, rawText) {
  if (!rawText || rawText.trim().length < 20) return { detected: false, type: null, message: null };

  const lower = rawText.toLowerCase();
  const sentences = rawText
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 8);

  // Score each loop type purely from the raw text
  const scores = {};

  for (const [type, pattern] of Object.entries(LOOP_PATTERNS)) {
    const triggerHits = pattern.triggers.filter(t => lower.includes(t)).length;
    const hasFearSignal = pattern.fearSignals.some(f => lower.includes(f));
    // Social loop doesn't always need an explicit fear word
    const qualifies = type === 'social' ? triggerHits >= pattern.minScore : (triggerHits >= pattern.minScore && hasFearSignal);
    scores[type] = qualifies ? triggerHits + (hasFearSignal ? 1 : 0) : 0;
  }

  // Pick the highest-scoring type that actually qualified
  const winner = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])[0];

  if (!winner) return { detected: false, type: null, message: null };

  const [loopType] = winner;
  const lt = LOOP_TYPES[loopType];
  const chainFromText = LOOP_PATTERNS[loopType].extractChain(sentences, lower);

  // If we can't extract anything meaningful from the text, don't fire the loop
  if (!chainFromText) return { detected: false, type: null, message: null };

  return {
    detected: true,
    type: loopType,
    label: lt.label,
    emoji: lt.emoji,
    tagline: lt.tagline,
    chain: chainFromText,
    rootAssumption: lt.rootAssumption,
    steps: lt.steps,
    message: lt.tagline,
  };
}

// ─── Bias Detector ────────────────────────────────────────────────────────────
export function detectBiases(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [key, bias] of Object.entries(BIAS_LIBRARY)) {
    const hit = bias.patterns.some(p => lower.includes(p));
    if (hit) found.push({ key, ...bias });
  }
  return found;
}

// ─── Reframe Engine ───────────────────────────────────────────────────────────
export function getReframes(text) {
  const lower = text.toLowerCase();
  const results = [];
  for (const r of REFRAMES) {
    if (r.trigger.some(t => lower.includes(t))) {
      results.push(r.reframe);
    }
  }
  if (results.length === 0) {
    results.push("What would the bravest version of you do right now?");
    results.push("What small action could reduce the uncertainty today?");
  }
  return results.slice(0, 4);
}

// ─── Scenario Generator ───────────────────────────────────────────────────────
export function generateScenarios(text, nodes) {
  const fearPct = getFearPercent(nodes);
  const hasOpp  = nodes.some(n => n.type === 'opp');
  const hasPast = nodes.some(n => n.type === 'past');
  const hasPressure = nodes.some(n => n.type === 'pressure');

  return {
    best: {
      title: 'Best Case',
      probability: fearPct > 60 ? 25 : 40,
      description: hasOpp
        ? "You embrace this decision, encounter unexpected opportunities, and grow beyond what you imagined today."
        : "The change creates momentum. You adapt faster than expected and build new confidence.",
      color: '#86efac',
      emoji: '🌱',
    },
    realistic: {
      title: 'Most Likely',
      probability: fearPct > 60 ? 55 : 50,
      description: hasPast
        ? "Like before, you'll face challenges — but your experience will guide you. Progress is uneven but real."
        : "There will be difficult moments and rewarding ones. You'll figure things out as they come, as you always have.",
      color: '#93c5fd',
      emoji: '🌤️',
    },
    worst: {
      title: 'Worst Case',
      probability: fearPct > 60 ? 20 : 10,
      description: hasPressure
        ? "Even if things go wrong, external pressures are temporary. You will recover — that's not in question."
        : "Things could be harder than expected. But hard doesn't mean permanent. Most setbacks become stories.",
      color: '#fda4af',
      emoji: '⛈️',
    },
  };
}

// ─── Split Analysis ───────────────────────────────────────────────────────────
export function getSplitAnalysis(nodes) {
  const emotional = nodes.filter(n => ['fear', 'pressure', 'past'].includes(n.type));
  const logical   = nodes.filter(n => ['logic', 'opp', 'unknown'].includes(n.type));
  const total = emotional.length + logical.length || 1;
  return {
    emotionalPct: Math.round((emotional.length / total) * 100),
    logicalPct:   Math.round((logical.length  / total) * 100),
    emotional,
    logical,
  };
}

// ─── Clarity Report ───────────────────────────────────────────────────────────
export function generateReport(text, nodes, biases, fearPct) {
  const split = getSplitAnalysis(nodes);
  const loop  = detectLoop(nodes, text);
  const reframes = getReframes(text);

  const confidence = Math.max(20, Math.min(92,
    100 - fearPct * 0.5 - biases.length * 8 + nodes.filter(n => n.type === 'logic').length * 10 + nodes.filter(n => n.type === 'opp').length * 8
  ));

  let decision = '';
  if (nodes.filter(n => n.type === 'opp').length > nodes.filter(n => n.type === 'fear').length) {
    decision = "Your thinking shows more opportunity than fear. Moving forward is supported by your own reasoning.";
  } else if (fearPct > 65) {
    decision = "Fear is dominating your reasoning. Revisit this once you've separated emotion from evidence.";
  } else {
    decision = "Your thinking is balanced. Trust yourself — the uncertainty you feel is normal, not a warning sign.";
  }

  const keyFactors = [
    ...nodes.filter(n => n.type === 'logic').map(n => ({ label: n.label, icon: '💙' })),
    ...nodes.filter(n => n.type === 'opp').map(n => ({ label: n.label, icon: '🌿' })),
    ...nodes.filter(n => n.type === 'fear').slice(0, 2).map(n => ({ label: n.label, icon: '🌸' })),
  ].slice(0, 5);

  return { confidence: Math.round(confidence), decision, keyFactors, split, biases: biases.slice(0, 3), reframes, loop };
}

// ─── Pattern Memory ───────────────────────────────────────────────────────────
const MEMORY_KEY = 'ce_patterns';

export function savePattern(nodes, biases) {
  try {
    const existing = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
    const entry = {
      date: new Date().toISOString(),
      fearCount: nodes.filter(n => n.type === 'fear').length,
      biases: biases.map(b => b.key),
      dominantType: ['fear','logic','opp','unknown','pressure','past']
        .map(t => ({ t, c: nodes.filter(n => n.type === t).length }))
        .sort((a,b) => b.c - a.c)[0]?.t || 'unknown',
    };
    existing.push(entry);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(existing.slice(-20)));
  } catch (_) {}
}

export function getPatternInsight() {
  try {
    const data = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
    if (data.length < 2) return null;
    const avgFear = data.reduce((s, d) => s + d.fearCount, 0) / data.length;
    const careerCount = 0; // future: tag topics
    const topBias = {};
    data.forEach(d => d.biases.forEach(b => { topBias[b] = (topBias[b] || 0) + 1; }));
    const topBiasKey = Object.entries(topBias).sort((a,b) => b[1]-a[1])[0]?.[0];
    if (avgFear > 2.5 && topBiasKey) {
      return `Pattern detected: You tend to ${topBiasKey === 'catastrophizing' ? 'catastrophize outcomes' : topBiasKey === 'fearBias' ? 'let fear lead your thinking' : 'overthink with ' + topBiasKey} across multiple decisions.`;
    }
    if (avgFear > 2) {
      return `Pattern detected: Fear nodes appear in all your recent thinking sessions. You may be underestimating your resilience.`;
    }
    return null;
  } catch (_) { return null; }
}

// ─── Graph Layout ─────────────────────────────────────────────────────────────
// Pre-compute positions for up to 13 nodes in organic radial layout
const W = 560, H = 520, CX = W / 2, CY = H / 2;

export function computeLayout(nodes) {
  const nonCore = nodes.filter(n => n.type !== 'core');
  const ring1Count = Math.min(nonCore.length, 5);
  const ring2Count = nonCore.length - ring1Count;

  return nodes.map(node => {
    if (node.type === 'core') return { ...node, x: CX, y: CY };
    const idx = nonCore.indexOf(node);
    if (idx < ring1Count) {
      const angle = (idx / ring1Count) * Math.PI * 2 - Math.PI / 2 + (idx % 2 === 0 ? 0.18 : -0.18);
      const r = 148 + (idx % 3) * 18;
      return { ...node, x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
    } else {
      const i2 = idx - ring1Count;
      const angle = (i2 / Math.max(ring2Count, 1)) * Math.PI * 2 - Math.PI / 3;
      const r = 235 + (i2 % 2) * 20;
      return { ...node, x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
    }
  });
}
