import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GPTNudge({ nudges = [], dominant, hasKey }) {
  const [dismissed, setDismissed] = useState([]);
  const visible = nudges.filter((_, i) => !dismissed.includes(i));

  if (!visible.length) return null;

  return (
    <div className="pointer-events-none absolute bottom-24 right-5 z-30 flex flex-col gap-2 items-end max-w-xs">
      <AnimatePresence mode="popLayout">
        {visible.map((nudge, i) => (
          <motion.div
            key={nudge}
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="pointer-events-auto"
          >
            <div
              className="relative flex items-start gap-2.5 px-4 py-3 rounded-2xl text-sm leading-snug shadow-lg max-w-[260px]"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1.5px solid rgba(244,114,182,0.28)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 24px rgba(244,114,182,0.12)',
              }}
            >
              {/* Number badge */}
              <span
                className="text-[9px] font-black shrink-0 mt-0.5 tabular-nums"
                style={{ color: 'rgba(244,114,182,0.50)' }}
              >
                {String(i + 1).padStart(2, '0')}.
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-[9px] font-black tracking-widest text-rose-400 uppercase">
                    {hasKey ? 'GPT Insight' : 'Thinking Guide'}
                  </p>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">{nudge}</p>
              </div>

              <button
                onClick={() => setDismissed(prev => [...prev, nudges.indexOf(nudge)])}
                className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors text-sm leading-none mt-0.5"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
