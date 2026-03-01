import { motion } from 'framer-motion';

const INK  = '#2c1a0e';
const MUTED = '#9a7a62';

export default function BrewAnimation({ order, brewName, steps }) {
  const lines = (steps || []).map(s => {
    const chosen = s.options.find(o => o.id === order?.[s.id]);
    return chosen ? { emoji: chosen.emoji, label: chosen.label, step: s.label } : null;
  }).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-6"
    >
      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(92,60,30,0.5)' }}>
        Brewing your order…
      </p>

      {/* Cup */}
      <div className="relative" style={{ width: 80, height: 108 }}>
        <svg width="80" height="108" viewBox="0 0 80 108" fill="none">
          <path d="M12 16 L6 95 Q6 103 16 103 L64 103 Q74 103 74 95 L68 16 Z"
            fill="#f5ead8" stroke="rgba(92,60,30,0.45)" strokeWidth="1.5" />
          <path d="M68 36 Q86 36 86 52 Q86 68 68 68"
            fill="none" stroke="rgba(92,60,30,0.4)" strokeWidth="1.5" />
          <ellipse cx="40" cy="16" rx="28" ry="5" fill="#ecdcc8" stroke="rgba(92,60,30,0.45)" strokeWidth="1.5" />
        </svg>
        <div className="absolute overflow-hidden"
          style={{ left: 13, top: 19, width: 54, height: 74, borderRadius: '0 0 10px 10px' }}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            style={{ background: 'linear-gradient(to bottom, #c8894a, #8b5e38)', width: '100%' }}
          />
        </div>

        {/* Steam */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: 28 + i * 18,
              top: 4,
              width: 3,
              height: 20,
              borderRadius: 8,
              background: 'rgba(92,60,30,0.2)',
              transformOrigin: 'bottom center',
            }}
            animate={{ scaleY: [0, 1, 0], opacity: [0, 0.6, 0], y: [0, -16, -32] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Order receipt */}
      <div className="w-full max-w-xs px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(92,60,30,0.15)' }}>
        {lines.map((line, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.2, duration: 0.3 }}
            className="flex items-center gap-2.5 py-1.5"
            style={{ borderBottom: i < lines.length - 1 ? '1px solid rgba(92,60,30,0.08)' : 'none' }}
          >
            <span className="text-base shrink-0">{line.emoji}</span>
            <div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: MUTED, fontFamily: 'monospace' }}>{line.step}</p>
              <p className="text-sm font-bold" style={{ color: INK, fontFamily: 'Georgia, serif' }}>{line.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Brew name */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 + lines.length * 0.2 + 0.3, duration: 0.5 }}
        className="font-serif text-lg text-center"
        style={{ color: INK }}
      >
        {brewName}
      </motion.p>

      {/* Pulse indicator */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'rgba(92,60,30,0.4)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
