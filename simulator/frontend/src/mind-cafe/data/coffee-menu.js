export const STEPS = [
  {
    id: 'base',
    label: 'The Base',
    prompt: 'What are we making today?',
    options: [
      { id: 'espresso',  label: 'Espresso',   emoji: '☕',  desc: 'Short, bold, no ceremony' },
      { id: 'latte',     label: 'Latte',       emoji: '🥛',  desc: 'Smooth and lingering' },
      { id: 'americano', label: 'Americano',   emoji: '🫗',  desc: 'Clean and open' },
      { id: 'matcha',    label: 'Matcha',      emoji: '🍵',  desc: 'Calm and grounding' },
      { id: 'chai',      label: 'Chai',        emoji: '🌿',  desc: 'Warm and spiced' },
      { id: 'cold_brew', label: 'Cold Brew',   emoji: '🧊',  desc: 'Cool and unhurried' },
    ],
  },
  {
    id: 'milk',
    label: 'The Milk',
    prompt: 'How do you take it?',
    options: [
      { id: 'oat',   label: 'Oat Milk',   emoji: '🌾', desc: 'Gentle and creamy' },
      { id: 'cream', label: 'Full Cream',  emoji: '🐄', desc: 'Rich and grounding' },
      { id: 'almond',label: 'Almond',      emoji: '🌰', desc: 'Light and a little nutty' },
      { id: 'black', label: 'Black',       emoji: '🖤', desc: 'Nothing extra needed' },
    ],
  },
  {
    id: 'strength',
    label: 'The Strength',
    prompt: 'How strong should it be?',
    options: [
      { id: 'half',   label: 'Half Shot', emoji: '🌙', desc: "Easy — don't push it" },
      { id: 'single', label: 'Single',    emoji: '◎',  desc: 'Steady and measured' },
      { id: 'double', label: 'Double',    emoji: '⚡',  desc: 'Got a lot left to do' },
      { id: 'triple', label: 'Triple',    emoji: '🔥',  desc: 'Running on fumes' },
    ],
  },
  {
    id: 'sweet',
    label: 'The Sweetness',
    prompt: 'A little sweetness?',
    options: [
      { id: 'none',  label: 'None',          emoji: '○',  desc: 'Take it as it is' },
      { id: 'sugar', label: 'One Sugar',      emoji: '🍬', desc: 'A small comfort' },
      { id: 'honey', label: 'Honey',          emoji: '🍯', desc: 'Golden and soft' },
      { id: 'syrup', label: 'Vanilla Syrup',  emoji: '🌸', desc: 'A little more warmth' },
    ],
  },
  {
    id: 'finish',
    label: 'The Finishing Touch',
    prompt: 'Anything to finish it off?',
    options: [
      { id: 'cinnamon', label: 'Cinnamon',      emoji: '🌀', desc: 'Familiar, like home' },
      { id: 'foam',     label: 'Extra Foam',     emoji: '☁️', desc: 'Something to hold onto' },
      { id: 'iced',     label: 'Over Ice',       emoji: '❄️', desc: 'Slow it down a little' },
      { id: 'plain',    label: 'Just like that', emoji: '✨', desc: 'Already enough' },
    ],
  },
];

export function getOrderName(order) {
  const base     = STEPS[0].options.find(o => o.id === order.base)?.label     || '';
  const milk     = order.milk === 'black' ? '' : (STEPS[1].options.find(o => o.id === order.milk)?.label || '');
  const strength = STEPS[2].options.find(o => o.id === order.strength)?.label || '';
  const sweet    = order.sweet === 'none'  ? '' : (STEPS[3].options.find(o => o.id === order.sweet)?.label || '');
  const finish   = order.finish === 'plain' ? '' : (STEPS[4].options.find(o => o.id === order.finish)?.label || '');

  let name = [strength, milk, base].filter(Boolean).join(' ');
  const extras = [sweet, finish].filter(Boolean);
  if (extras.length) name += ` with ${extras.join(' & ')}`;
  return name;
}

export function scoreOrder(order, needs) {
  if (!needs || !Object.keys(needs).length) return 0.5;
  // Weighted: base 35%, strength 30%, milk 15%, sweet 12%, finish 8%
  const weights = { base: 0.35, strength: 0.30, milk: 0.15, sweet: 0.12, finish: 0.08 };
  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (needs[key] && order[key] === needs[key]) score += weight;
  }
  return score;
}

export function getReaction(score) {
  if (score >= 0.60) return { label: 'Perfect',        emoji: '🫶', text: "This is exactly what I needed. How did you know?",              color: '#86efac', border: '#16a34a', hearts: 0,  xp: 30 };
  if (score >= 0.40) return { label: 'Almost',         emoji: '☕', text: "Almost there. Still — this is good.",                          color: '#fde68a', border: '#d97706', hearts: 0,  xp: 20 };
  if (score >= 0.25) return { label: 'A little off',   emoji: '🌫️', text: "Not quite right, but… thank you for trying.",                  color: '#e9d5ff', border: '#9333ea', hearts: 0,  xp: 10 };
  return              { label: 'Missed the mark', emoji: '💧', text: "I don't think this is what I was looking for.",                  color: '#fecaca', border: '#dc2626', hearts: -1, xp: 5  };
}
