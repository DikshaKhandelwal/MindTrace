import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AFFIRMATIONS = [
  "you are doing better than you think.",
  "resting is not the same as giving up.",
  "you don't have to have it figured out.",
  "being tired is allowed.",
  "you've gotten through hard days before.",
  "you are allowed to take up space.",
  "slow days count too.",
  "you don't owe anyone a perfect version of yourself.",
  "it's okay to not be okay for a bit.",
  "you are more than your productivity.",
  "small steps still move you forward.",
  "your feelings make sense.",
  "asking for help is a kind thing to do for yourself.",
  "you matter, even on the quiet days.",
  "today doesn't define you.",
  "you are held.",
  "you are not behind.",
  "it's okay to start over.",
  "one breath at a time is enough.",
  "you were brave today, even if it didn't feel like it.",
];

const BG_TINTS = [
  '#fde8ee', '#fce4f0', '#fbe8f4', '#fde4eb',
  '#fce6f0', '#fde8f2', '#fce4ed', '#fde6ef',
];

const HEARTS = ['❤️','💕','💗','💓','🩷','💖','💝'];

function useHeartParticles(tick) {
  return Array.from({ length: 9 }, (_, i) => ({
    id:     `${tick}-${i}`,
    xBase:  (Math.sin(tick * 3.7 + i * 91) * 80),
    wobble: Math.sin(i * 2.1) * 32,
    dur:    2.2 + (i % 4) * 0.5,
    delay:  i * 0.18,
    size:   13 + (i % 5) * 8,
    heart:  HEARTS[i % HEARTS.length],
  }));
}

function HeartBurst({ tick }) {
  const particles = useHeartParticles(tick);
  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{ bottom: 'calc(50% + 50px)', left: '50%', transform: 'translateX(-50%)' }}
    >
      {particles.map(h => (
        <motion.span
          key={h.id}
          className="absolute"
          style={{ fontSize: h.size, left: h.xBase, bottom: 0, userSelect: 'none' }}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -260, opacity: 0, scale: 1.2, x: [0, h.wobble, -h.wobble * 0.4, h.wobble * 0.2, 0] }}
          transition={{ duration: h.dur, delay: h.delay, ease: [0.15, 0, 0.4, 1] }}
        >
          {h.heart}
        </motion.span>
      ))}
    </div>
  );
}

function Teddy({ kissing }) {
  return (
    <motion.div
      animate={{
        scale:  [1, 1.07, 0.97, 1.04, 1],
        rotate: [0, -4, 4, -2, 0],
        y:      [0, -10, 2, -5, 0],
      }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      className="select-none relative"
      style={{
        fontSize: 'clamp(5rem, 18vw, 9rem)',
        lineHeight: 1,
        filter: kissing
          ? 'drop-shadow(0 8px 40px rgba(220,60,110,0.45))'
          : 'drop-shadow(0 6px 30px rgba(200,60,110,0.22))',
        transition: 'filter 0.3s ease',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={kissing ? 'kiss' : 'normal'}
          initial={{ scale: 0.75, opacity: 0, rotate: kissing ? -12 : 12 }}
          animate={{ scale: 1,    opacity: 1, rotate: 0 }}
          exit={{    scale: 0.75, opacity: 0, rotate: kissing ? 12 : -12 }}
          transition={{ duration: 0.22, ease: 'backOut' }}
          className="inline-block"
        >
          🧸
        </motion.span>
      </AnimatePresence>

      {/* Kiss sparkle overlay */}
      {kissing && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5, x: 10, y: -10 }}
          animate={{ opacity: 1, scale: 1.2, x: 18, y: -22 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 right-0 text-3xl select-none pointer-events-none"
          style={{ lineHeight: 1 }}
        >
          💋
        </motion.span>
      )}
    </motion.div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function JoyPage({ onDone }) {
  const [phrases]   = useState(() => shuffle(AFFIRMATIONS));
  const [index,     setIndex]     = useState(0);
  const [tintIdx,   setTintIdx]   = useState(0);
  const [heartTick, setHeartTick] = useState(0);
  const [kissing,   setKissing]   = useState(false);
  const [exiting,   setExiting]   = useState(false);
  const kissTimer   = useRef(null);

  const isLast = index >= phrases.length - 1;

  const advance = useCallback(() => {
    if (exiting) return;
    setKissing(true);
    setHeartTick(t => t + 1);
    clearTimeout(kissTimer.current);
    kissTimer.current = setTimeout(() => setKissing(false), 850);
    if (isLast) {
      setExiting(true);
      setTimeout(onDone, 1200);
      return;
    }
    setIndex(i => i + 1);
    setTintIdx(t => (t + 1) % BG_TINTS.length);
  }, [isLast, exiting, onDone]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') advance();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance]);

  useEffect(() => () => clearTimeout(kissTimer.current), []);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
      animate={{ backgroundColor: BG_TINTS[tintIdx] }}
      transition={{ duration: 0.8 }}
      style={{ backgroundColor: BG_TINTS[0] }}
      onClick={advance}
    >
      {/* Polka-dot overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(230,100,150,0.11) 1.5px, transparent 1.5px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Counter */}
      <div
        className="absolute top-7 right-7 z-10 font-mono text-xs"
        style={{ color: 'rgba(160,50,90,0.32)' }}
      >
        {index + 1} <span style={{ opacity: 0.5 }}>/ {phrases.length}</span>
      </div>

      {/* Leave button */}
      <button
        onClick={e => { e.stopPropagation(); onDone(); }}
        className="absolute top-7 left-7 font-mono text-xs z-20 transition-all"
        style={{ color: 'rgba(160,50,90,0.22)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,50,90,0.60)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,50,90,0.22)'}
      >
        ← leave
      </button>

      {/* Heart burst — fires on every tap */}
      <AnimatePresence>
        <HeartBurst key={heartTick} tick={heartTick} />
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-8 text-center" style={{ maxWidth: '36ch' }}>

        {/* Teddy */}
        <Teddy kissing={kissing} />

        {/* Reaffirming phrase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.48, ease: [0.2, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <p
              className="font-serif font-black leading-snug"
              style={{
                fontSize: 'clamp(1.75rem, 4.5vw, 2.9rem)',
                color: '#5c1a35',
                letterSpacing: '-0.01em',
              }}
            >
              {phrases[index]}
            </p>

            {/* Animated heart trio */}
            <div className="flex gap-3" style={{ fontSize: '1.3rem' }}>
              {['💗', '💕', '💗'].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ scale: [1, 1.35, 1], y: [0, -5, 0] }}
                  transition={{ duration: 1.5, delay: i * 0.28, repeat: Infinity, ease: 'easeInOut' }}
                  className="select-none"
                >
                  {h}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom hint + dots */}
      <div className="absolute bottom-8 flex flex-col items-center gap-3 z-10">
        <motion.p
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="font-mono text-xs"
          style={{ color: 'rgba(160,50,90,0.45)' }}
        >
          {isLast ? 'one last tap ♥' : 'tap for another ♥'}
        </motion.p>

        <div className="flex gap-1.5">
          {phrases.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width:      i === index ? 18 : 5,
                height:     5,
                background: i === index
                  ? 'rgba(160,50,90,0.55)'
                  : i < index
                  ? 'rgba(160,50,90,0.25)'
                  : 'rgba(160,50,90,0.12)',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
