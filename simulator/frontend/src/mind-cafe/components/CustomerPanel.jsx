import { motion } from 'framer-motion';

export default function CustomerPanel({ customer, dialogueIdx, isNight, onNext }) {
  const line = customer.dialogues[dialogueIdx];
  const total = customer.dialogues.length;
  const isLast = dialogueIdx === total - 1;

  return (
    <motion.div
      key={dialogueIdx}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-lg"
    >
      {/* Customer header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">
          {customer.avatar}
        </div>
        <div>
          <p className="font-serif text-lg leading-tight" style={{ color: '#2c1a0e' }}>{customer.name}</p>
          <p className="font-mono text-xs" style={{ color: 'rgba(92,60,30,0.55)' }}>{customer.role}</p>
        </div>
        {/* Progress dots */}
        <div className="ml-auto flex items-center gap-1.5">
          {customer.dialogues.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i <= dialogueIdx ? '#2c1a0e' : 'rgba(92,60,30,0.2)' }} />
          ))}
        </div>
      </div>

      {/* Dialogue bubble */}
      <div className="relative mb-8 px-6 py-5"
        style={{
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(92,60,30,0.2)',
        }}>
        {/* Quotes */}
        <span className="absolute top-3 left-4 text-3xl leading-none select-none"
          style={{ color: 'rgba(92,60,30,0.15)', fontFamily: 'Georgia, serif' }}>
          "
        </span>
        <motion.p
          key={line}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-lg leading-relaxed pl-4"
          style={{ color: '#2c1a0e' }}
        >
          {line}
        </motion.p>
      </div>

      {/* Action */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="px-8 py-3 font-mono text-xs uppercase tracking-widest transition-all"
          style={{
            background: isLast ? '#2c1a0e' : 'transparent',
            border: `1px solid ${isLast ? '#2c1a0e' : 'rgba(92,60,30,0.25)'}`,
            color: isLast ? '#fef3c7' : 'rgba(92,60,30,0.6)',
          }}
        >
          {isLast ? '☕ Start brewing →' : 'Continue...'}
        </motion.button>
      </div>
    </motion.div>
  );
}
