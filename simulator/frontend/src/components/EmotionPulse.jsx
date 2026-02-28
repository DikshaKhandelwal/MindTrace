import { motion, AnimatePresence } from 'framer-motion';

const emotionConfig = {
  defensive:   { color: '#ef4444', bg: '#fef2f2', label: 'Defensive',   emoji: '🛡️' },
  hurt:        { color: '#f97316', bg: '#fff7ed', label: 'Hurt',        emoji: '💔' },
  guilty:      { color: '#a855f7', bg: '#faf5ff', label: 'Guilty',      emoji: '😔' },
  frustrated:  { color: '#eab308', bg: '#fefce8', label: 'Frustrated',  emoji: '😤' },
  calm:        { color: '#22c55e', bg: '#f0fdf4', label: 'Calm',        emoji: '😌' },
  confused:    { color: '#6366f1', bg: '#eef2ff', label: 'Confused',    emoji: '😕' },
  apologetic:  { color: '#ec4899', bg: '#fdf2f8', label: 'Apologetic',  emoji: '🙏' },
  resistant:   { color: '#ef4444', bg: '#fef2f2', label: 'Resistant',   emoji: '🚫' },
  warming:     { color: '#f59e0b', bg: '#fffbeb', label: 'Warming up',  emoji: '🌤️' },
  dismissive:  { color: '#6b7280', bg: '#f9fafb', label: 'Dismissive',  emoji: '😒' },
  vulnerable:  { color: '#f472b6', bg: '#fdf2f8', label: 'Vulnerable',  emoji: '🌸' },
};

export default function EmotionPulse({ emotion, intensity = 0.5, subtext, compact = false }) {
  const cfg = emotionConfig[emotion?.toLowerCase()] || emotionConfig.calm;
  const size = compact ? 36 : 56;

  if (compact) {
    return (
      <AnimatePresence mode="wait">
        <motion.span
          key={emotion}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.emoji} {cfg.label}
        </motion.span>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={emotion}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-3"
      >
        {/* Ring + emoji */}
        <div className="relative flex items-center justify-center" style={{ width: size + 24, height: size + 24 }}>
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: cfg.color + '20' }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
          />
          <motion.div
            className="absolute inset-2 rounded-full flex items-center justify-center text-3xl"
            style={{ background: cfg.bg, border: `2px solid ${cfg.color}30` }}
          >
            {cfg.emoji}
          </motion.div>
        </div>

        {/* Emotion label */}
        <div className="text-center">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Intensity bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: cfg.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(intensity * 100)}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>

        {/* Subtext */}
        {subtext && (
          <motion.p
            key={subtext}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 italic text-center leading-relaxed"
          >
            "{subtext}"
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export { emotionConfig };
