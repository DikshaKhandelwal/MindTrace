import { motion } from 'framer-motion';

export default function BrewAnimation({ selected, brewName, ingredients }) {
  const layers = selected.map(id => ingredients.find(i => i.id === id)).filter(Boolean);

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
      <div className="relative" style={{ width: 100, height: 130 }}>
        {/* Cup outline */}
        <svg width="100" height="130" viewBox="0 0 100 130" fill="none" className="absolute inset-0">
          {/* Cup body */}
          <path d="M15 20 L8 115 Q8 122 18 122 L82 122 Q92 122 92 115 L85 20 Z"
            fill="#f5ead8" stroke="rgba(92,60,30,0.45)" strokeWidth="1.5" />
          {/* Handle */}
          <path d="M85 45 Q108 45 108 65 Q108 85 85 85"
            fill="none" stroke="rgba(92,60,30,0.4)" strokeWidth="2" />
          {/* Rim */}
          <ellipse cx="50" cy="20" rx="35" ry="6" fill="#ecdcc8" stroke="rgba(92,60,30,0.45)" strokeWidth="1.5" />
        </svg>

        {/* Liquid layers */}
        <div className="absolute overflow-hidden"
          style={{ left: 16, top: 24, width: 68, height: 88, borderRadius: '0 0 12px 12px' }}>
          {layers.map((ing, i) => (
            <motion.div
              key={ing.id}
              initial={{ height: 0 }}
              animate={{ height: `${100 / layers.length}%` }}
              transition={{ duration: 0.7, delay: i * 0.45, ease: 'easeInOut' }}
              style={{
                background: `linear-gradient(to bottom, ${ing.color}cc, ${ing.color}88)`,
                width: '100%',
              }}
            />
          ))}
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

      {/* Brew name reveal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="text-center"
      >
        <p className="font-serif text-xl mb-1" style={{ color: '#2c1a0e' }}>{brewName}</p>
        <div className="flex justify-center gap-2 mt-2">
          {layers.map(ing => (
            <span key={ing.id} className="text-lg">{ing.emoji}</span>
          ))}
        </div>
      </motion.div>

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
