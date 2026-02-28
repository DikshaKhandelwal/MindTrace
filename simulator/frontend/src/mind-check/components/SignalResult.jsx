import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';

const SIGNAL_LABELS = {
  tension:       'Chronic tension',
  disconnection: 'Emotional distance',
  fatigue:       'Deep fatigue',
  rumination:    'Looping thoughts',
  meaning:       'Loss of meaning',
};

const RESULTS = {
  low: {
    cardBg:      '#c5d9c0',
    cardText:    '#1a2e18',
    label:       'Clear signal.',
    headline:    "You're carrying\nnormal weight.",
    body:        "What you described is consistent with the friction of an ordinary life. That doesn't mean everything is fine — but right now, no single signal is asking for attention.",
    note:        "That can always change. Checking in with yourself regularly is itself a healthy habit.",
    action:      null,
  },
  medium: {
    cardBg:      '#e8c96a',
    cardText:    '#2a1f00',
    label:       'Notable signal.',
    headline:    "Worth having\na conversation.",
    body:        "Some of what you described points to patterns that don't resolve on their own with time. Not crisis — but not nothing either.",
    note:        "A single conversation with a counsellor or therapist — even just one session — can make a measurable difference. You don't need to be in crisis to reach out.",
    action:      { label: 'What to do', text: 'Look for a therapist, GP, or school/work counsellor. Tell them what you told this app. You have enough to start with.' },
  },
  high: {
    cardBg:      '#c94f3a',
    cardText:    '#fff5f0',
    label:       'Strong signal.',
    headline:    "Please reach\nout to someone.",
    body:        "Across multiple situations, you described patterns that are consistent with prolonged distress — the kind that tends to deepen without support.",
    note:        "This is not a weakness. It is a signal. You don't have to describe it perfectly or have the right words. You just have to tell someone what your days feel like.",
    action:      { label: 'Start here', text: 'Talk to a GP, call a crisis line, or message a therapist today. If cost is a barrier, community mental health centres often offer free or sliding scale sessions.' },
  },
};

const SIGNAL_THRESHOLDS = { low: 2, medium: 4 };

function DominantSignals({ signals, level }) {
  const color = level === 'high' ? 'rgba(255,245,240,0.55)' : level === 'medium' ? 'rgba(42,31,0,0.45)' : 'rgba(26,46,24,0.45)';
  const barBg = level === 'high' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)';
  const barFill = level === 'high' ? 'rgba(255,245,240,0.60)' : 'rgba(0,0,0,0.30)';
  const maxVal = Math.max(...Object.values(signals), 1);

  return (
    <div className="flex flex-col gap-2 mt-1">
      {Object.entries(signals)
        .sort((a, b) => b[1] - a[1])
        .filter(([, v]) => v > 0)
        .map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <span className="font-mono text-xs" style={{ color }}>{SIGNAL_LABELS[key]}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: barBg }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: barFill }}
                initial={{ width: 0 }}
                animate={{ width: `${(val / (maxVal * 3)) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.4 }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}

export default function SignalResult({ result, onRestart, onBack, onJoy }) {
  const cfg = RESULTS[result.level];

  return (
    <div className="check-bg min-h-screen flex flex-col items-center justify-center px-5 py-14 relative">

      {/* Back */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 left-6 flex items-center gap-2 font-mono text-xs text-black/30 hover:text-black/55 transition-colors"
      >
        <ArrowLeft size={13} /> Hub
      </motion.button>

      {/* Restart */}
      <motion.button
        onClick={onRestart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 right-6 flex items-center gap-2 font-mono text-xs text-black/30 hover:text-black/55 transition-colors"
      >
        <RotateCcw size={13} /> Retake
      </motion.button>

      <div className="w-full max-w-sm flex flex-col gap-5">

        {/* Main result card — like screenshot 2 */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.2, 0, 0.2, 1] }}
          className="rounded-sm px-7 py-8 relative overflow-hidden"
          style={{ background: cfg.cardBg }}
        >
          <p className="font-mono text-xs font-bold tracking-widest uppercase mb-3" style={{ color: cfg.cardText, opacity: 0.5 }}>
            {cfg.label}
          </p>
          <h2
            className="font-serif font-black leading-none mb-5"
            style={{
              fontSize: 'clamp(2rem, 6vw, 2.8rem)',
              color: cfg.cardText,
              letterSpacing: '-0.02em',
              whiteSpace: 'pre-line',
            }}
          >
            {cfg.headline}
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: cfg.cardText, opacity: 0.72 }}>
            {cfg.body}
          </p>
          <DominantSignals signals={result.signals} level={result.level} />
        </motion.div>

        {/* Note card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="check-card px-6 py-5"
          style={{ background: '#ddd4c5' }}
        >
          <p className="font-mono text-sm leading-relaxed text-black/60">
            {cfg.note}
          </p>
        </motion.div>

        {/* Action card — only for medium/high */}
        {cfg.action && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="check-card px-6 py-5"
            style={{ background: '#e8e0d4' }}
          >
            <p className="font-mono text-xs font-bold tracking-widest uppercase text-black/40 mb-2">
              {cfg.action.label}
            </p>
            <p className="font-mono text-sm leading-relaxed text-black/65">
              {cfg.action.text}
            </p>
          </motion.div>
        )}

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="font-mono text-xs text-black/25 text-center leading-relaxed"
        >
          This is a signal, not a score.<br />Only a professional can give you a proper assessment.
        </motion.p>

        {/* Joy transition */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex flex-col items-center gap-2 pt-2"
        >
          <div className="w-16 h-px bg-black/10 mb-1" />
          <button
            onClick={onJoy}
            className="flex items-center gap-2 font-mono text-sm font-bold transition-all group"
            style={{ color: 'rgba(0,0,0,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(0,0,0,0.70)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.35)'}
          >
            <Sparkles size={13} />
            something nice before you go
          </button>
        </motion.div>

      </div>
    </div>
  );
}
