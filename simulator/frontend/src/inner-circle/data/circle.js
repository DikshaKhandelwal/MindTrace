// ── Mood meta ─────────────────────────────────────────────────────────────────
export const MOOD_META = {
  great:       { label: 'Great',       color: '#fbbf24', bg: 'bg-amber-400',    text: 'text-amber-300',   ring: 'ring-amber-400',   glow: 'mood-great',       dot: 'bg-amber-400' },
  okay:        { label: 'Okay',        color: '#34d399', bg: 'bg-emerald-400',  text: 'text-emerald-300', ring: 'ring-emerald-400', glow: 'mood-okay',        dot: 'bg-emerald-400' },
  low:         { label: 'Low',         color: '#fb923c', bg: 'bg-orange-400',   text: 'text-orange-300',  ring: 'ring-orange-400',  glow: 'mood-low',         dot: 'bg-orange-400' },
  overwhelmed: { label: 'Overwhelmed', color: '#f472b6', bg: 'bg-pink-400',     text: 'text-pink-300',    ring: 'ring-pink-400',    glow: 'mood-overwhelmed', dot: 'bg-pink-400' },
  silent:      { label: 'Silent',      color: '#94a3b8', bg: 'bg-slate-400',    text: 'text-slate-400',   ring: 'ring-slate-400',   glow: 'mood-silent',      dot: 'bg-slate-400' },
};

export const MOODS = ['great', 'okay', 'low', 'overwhelmed', 'silent'];

export const RELATIONS = ['Partner', 'Best Friend', 'Sibling', 'Parent', 'Friend', 'Colleague', 'Mentor'];

export const SUPPORT_STYLES = [
  { key: 'check-ins',     label: 'Regular Check-ins',  desc: 'Appreciates being checked on proactively' },
  { key: 'space',         label: 'Prefers Space',        desc: 'Reaches out when ready' },
  { key: 'direct-advice', label: 'Direct Advice',        desc: 'Wants clear, practical input' },
  { key: 'just-listen',   label: 'Needs to be Heard',    desc: 'Wants presence, not solutions' },
];

// ── Circle members — starts empty, user builds their real circle ─────────────
export const CIRCLE_MEMBERS = [];


// ── My own state ──────────────────────────────────────────────────────────────
export const MY_INITIAL_STATE = {
  mood: 'okay',
  note: '',
  silenceMode: false,
  silentUntil: null,
  supportStyle: 'check-ins',
  name: 'You',
  initials: 'ME',
};

// ── Nudges / Smart Check-In suggestions ───────────────────────────────────────
export function getSmartNudges(members) {
  const nudges = [];

  members.forEach(m => {
    if (m.riskLevel === 'high') {
      nudges.push({
        memberId: m.id,
        priority: 'high',
        message: `${m.name} has been ${m.currentMood} for ${m.streakDays} day${m.streakDays > 1 ? 's' : ''}. This might be a good time to reach out.`,
        action: 'compose',
      });
    } else if (m.riskLevel === 'medium') {
      nudges.push({
        memberId: m.id,
        priority: 'medium',
        message: `${m.name} seems ${m.currentMood}. A short check-in could mean a lot.`,
        action: 'compose',
      });
    }
  });

  return nudges;
}

// ── Shared growth insights ─────────────────────────────────────────────────────
export const SHARED_INSIGHTS = [
  "Most people feel lowest on Sunday evenings.",
  "A check-in shorter than 20 words gets 3x more responses.",
  "People who share their state regularly report feeling less alone.",
  "Checking in within 2 hours of someone going 'low' matters most.",
  "Saying 'I noticed you've been quiet' is more effective than 'are you okay?'",
];

// ── Check-in history (starts empty, grows as user interacts) ────────────
export const GLOBAL_HISTORY = [];

