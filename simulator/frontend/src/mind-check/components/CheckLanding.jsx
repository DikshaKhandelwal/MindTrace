import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft } from 'lucide-react';

const RULES = [
  'Ten situations. No right answers.',
  'Pick the one that actually fits.',
  'Takes about five minutes.',
];

export default function CheckLanding({ onStart, onBack }) {
  return (
    <div className="check-bg min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">

      {/* Back */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-6 left-6 flex items-center gap-2 text-black/30 hover:text-black/60 transition-colors text-sm font-mono"
      >
        <ChevronLeft size={16} /> Hub
      </motion.button>

      {/* Module badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-5 text-xs font-mono font-bold tracking-widest text-black/30 uppercase"
      >
        Module 05
      </motion.div>

      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7, ease: [0.2, 0, 0.2, 1] }}
        className="font-serif font-black text-center leading-none mb-2"
        style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', letterSpacing: '-0.02em', color: '#1a1510' }}
      >
        MIND CHECK
      </motion.h1>

      {/* Italic sub */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="font-serif italic text-black/50 text-center mb-14"
        style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)' }}
      >
        A signal — not a diagnosis.
      </motion.p>

      {/* Description card — exactly like screenshot 2 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="check-card px-8 py-6 max-w-sm w-full mb-10"
        style={{ background: '#d4c9b8' }}
      >
        <p className="font-mono font-bold text-sm mb-3 text-black/80 tracking-wide">
          What this is
        </p>
        <p className="font-mono text-sm leading-relaxed text-black/65">
          Ten real-life situations. Your honest reaction to each one. At the end, a clear signal about whether what you're carrying is normal weight — or worth taking seriously.
        </p>
      </motion.div>

      {/* Rules list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="flex flex-col gap-2 mb-12 items-center"
      >
        {RULES.map((r, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-sm text-black/45">
            <span className="text-black/25">—</span>
            {r}
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, type: 'spring', stiffness: 200 }}
        whileHover={{ x: 6 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="flex items-center gap-3 font-mono font-bold text-base text-black/75 hover:text-black transition-colors group"
      >
        Begin
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowRight size={20} />
        </motion.span>
      </motion.button>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 font-mono text-xs text-black/20 tracking-wider"
      >
        Not a clinical assessment. Not stored anywhere.
      </motion.p>
    </div>
  );
}
