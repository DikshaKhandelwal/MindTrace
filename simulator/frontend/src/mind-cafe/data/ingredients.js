export const INGREDIENTS = [
  { id: 'calm',        label: 'Calm',        emoji: '☁️',  color: '#bae6fd', dark: '#0369a1', textDark: '#082f49', desc: 'Quiets the noise' },
  { id: 'energy',      label: 'Energy',      emoji: '🔥',  color: '#fde68a', dark: '#b45309', textDark: '#451a03', desc: 'Sparks momentum' },
  { id: 'kindness',    label: 'Kindness',    emoji: '🌸',  color: '#fbcfe8', dark: '#be185d', textDark: '#500724', desc: 'Soft and open' },
  { id: 'quiet',       label: 'Quiet',       emoji: '🌙',  color: '#c7d2fe', dark: '#4338ca', textDark: '#1e1b4b', desc: 'Space to just be' },
  { id: 'reassurance', label: 'Reassurance', emoji: '💬',  color: '#bbf7d0', dark: '#15803d', textDark: '#052e16', desc: "You're not wrong" },
  { id: 'release',     label: 'Release',     emoji: '🌊',  color: '#99f6e4', dark: '#0f766e', textDark: '#042f2e', desc: 'Let it out gently' },
  { id: 'connection',  label: 'Connection',  emoji: '🤝',  color: '#fed7aa', dark: '#c2410c', textDark: '#431407', desc: 'You are not alone' },
  { id: 'warmth',      label: 'Warmth',      emoji: '💛',  color: '#fef08a', dark: '#a16207', textDark: '#3f2700', desc: 'Safe and held' },
];

// key = sorted ingredient ids joined by '+'
export const BREW_NAMES = {
  'calm+reassurance':              'Moonbeam Blend',
  'energy+reassurance':            'Golden Push',
  'calm+kindness':                 'Petal Drift',
  'connection+kindness':           'Sunrise Drip',
  'quiet+warmth':                  'Ember Silence',
  'release+warmth':                'Ember Unwind',
  'quiet+release+warmth':          'Deep Forest Steep',
  'calm+quiet+release':            'Still Waters Cold Brew',
  'calm+reassurance+warmth':       'Starlit Comfort',
  'calm+energy+reassurance':       'Morning Grace',
  'connection+kindness+warmth':    'Lantern House Brew',
  'calm+kindness+reassurance':     'Soft Landing Blend',
  'release+reassurance+warmth':    'The Long Exhale',
  'calm':                          'Cloud Nine Espresso',
  'warmth':                        'Hearth Latte',
  'quiet':                         'Midnight Pour',
  'release':                       'Open Sky Americano',
  'connection':                    'Crowded Solitude',
  'energy':                        'First Light Shot',
  'kindness':                      'Blossom Drip',
  'reassurance':                   "It's Okay Blend",
};

export function getBrewName(selectedIds) {
  if (selectedIds.length === 0) return 'Empty Cup';
  const key = [...selectedIds].sort().join('+');
  return BREW_NAMES[key] || buildGenericName(selectedIds);
}

function buildGenericName(ids) {
  const parts = ids.map(id => INGREDIENTS.find(i => i.id === id)?.label || id);
  return parts.join(' & ') + ' Brew';
}

export function scoreMatch(selectedIds, needIds) {
  if (needIds.length === 0) return 1;
  const sel = new Set(selectedIds);
  const nee = new Set(needIds);
  const intersection = [...sel].filter(x => nee.has(x)).length;
  const union = new Set([...sel, ...nee]).size;
  return union === 0 ? 0 : intersection / union;
}

export function getReaction(score) {
  if (score >= 0.8) return {
    emoji: '😌',
    label: 'Truly understood',
    text: 'Their shoulders drop. Something in their face softens. They wrap both hands around the cup and close their eyes.',
    color: '#bbf7d0',
    border: '#15803d',
    xp: 3,
    hearts: 0,
  };
  if (score >= 0.5) return {
    emoji: '🙂',
    label: 'A little better',
    text: 'They take a slow sip. Not quite what they needed, but something in it helped.',
    color: '#fef9c3',
    border: '#a16207',
    xp: 1,
    hearts: 0,
  };
  return {
    emoji: '😕',
    label: 'Not quite reached',
    text: 'They smile politely. The cup sits barely touched. They needed something you didn\'t put in.',
    color: '#fee2e2',
    border: '#b91c1c',
    xp: 0,
    hearts: -1,
  };
}
