import { motion, AnimatePresence } from 'framer-motion';

/**
 * GhostCharacter
 * state: 'fresh' | 'tired' | 'exhausted'
 * size: number (px width, default 180)
 */
export default function GhostCharacter({ state = 'tired', size = 180 }) {
  return (
    <motion.div
      style={{ width: size, height: size * 1.15, position: 'relative', flexShrink: 0 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 120 138"
        width={size}
        height={size * 1.15}
        style={{ overflow: 'visible', filter: `drop-shadow(0 8px 32px ${glowColor(state)})` }}
      >
        {/* Ghost glow */}
        <defs>
          <radialGradient id="ghostGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor={bodyColor(state)} stopOpacity="1" />
            <stop offset="100%" stopColor={bodyColorEdge(state)} stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="eyeGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#9b8fd4" />
            <stop offset="100%" stopColor="#6a4fa0" />
          </radialGradient>
          {state === 'exhausted' && (
            <filter id="blur2">
              <feGaussianBlur stdDeviation="1" />
            </filter>
          )}
        </defs>

        {/* ── Body ── */}
        <motion.path
          d="M18 55 Q18 10 60 10 Q102 10 102 55 L102 105 Q90 95 80 105 Q70 95 60 105 Q50 95 40 105 Q30 95 18 105 Z"
          fill="url(#ghostGlow)"
          animate={{ scaleY: state === 'exhausted' ? [1, 0.98, 1] : [1, 1.01, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Cheek blush (fresh only) ── */}
        {state === 'fresh' && (
          <>
            <ellipse cx="33" cy="70" rx="8" ry="5" fill="#f9a8d4" opacity="0.45" />
            <ellipse cx="87" cy="70" rx="8" ry="5" fill="#f9a8d4" opacity="0.45" />
          </>
        )}

        {/* ── Eyes ── */}
        <GhostEyes state={state} />

        {/* ── Mouth ── */}
        <GhostMouth state={state} />

        {/* ── Under-eye bags (tired / exhausted) ── */}
        {state !== 'fresh' && (
          <>
            <ellipse cx="43" cy="67" rx={state === 'exhausted' ? 10 : 8} ry={state === 'exhausted' ? 4 : 2.5}
              fill="#b8a9d4" opacity={state === 'exhausted' ? 0.6 : 0.3} />
            <ellipse cx="77" cy="67" rx={state === 'exhausted' ? 10 : 8} ry={state === 'exhausted' ? 4 : 2.5}
              fill="#b8a9d4" opacity={state === 'exhausted' ? 0.6 : 0.3} />
          </>
        )}

        {/* ── Sparkle stars (fresh) ── */}
        {state === 'fresh' && (
          <>
            <motion.text x="6" y="42" fontSize="12" textAnchor="middle"
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              style={{ transformOrigin: '6px 42px' }}
            >✦</motion.text>
            <motion.text x="114" y="38" fontSize="10" textAnchor="middle"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 }}
              style={{ transformOrigin: '114px 38px' }}
            >✦</motion.text>
          </>
        )}

        {/* ── Sign (exhausted: "Phone Off?") ── */}
        {state === 'exhausted' && <PhoneOffSign />}

        {/* ── ZZZ (tired / exhausted) ── */}
        {state !== 'fresh' && <FloatingZzz count={state === 'exhausted' ? 3 : 1} />}
      </svg>
    </motion.div>
  );
}

function GhostEyes({ state }) {
  if (state === 'fresh') {
    // Big bright open eyes with shine
    return (
      <>
        <ellipse cx="43" cy="57" rx="11" ry="12" fill="url(#eyeGrad)" />
        <ellipse cx="77" cy="57" rx="11" ry="12" fill="url(#eyeGrad)" />
        <circle cx="39" cy="53" r="3.5" fill="white" opacity="0.9" />
        <circle cx="73" cy="53" r="3.5" fill="white" opacity="0.9" />
        <circle cx="48" cy="60" r="1.5" fill="white" opacity="0.5" />
        <circle cx="82" cy="60" r="1.5" fill="white" opacity="0.5" />
      </>
    );
  }
  if (state === 'tired') {
    // Half-closed droopy eyelids
    return (
      <>
        <ellipse cx="43" cy="58" rx="11" ry="9" fill="url(#eyeGrad)" />
        <ellipse cx="77" cy="58" rx="11" ry="9" fill="url(#eyeGrad)" />
        {/* Droopy eyelid */}
        <path d="M32 54 Q43 50 54 54" fill="none" stroke="#c4b5d4" strokeWidth="5" strokeLinecap="round" />
        <path d="M66 54 Q77 50 88 54" fill="none" stroke="#c4b5d4" strokeWidth="5" strokeLinecap="round" />
        <circle cx="39" cy="57" r="2.5" fill="white" opacity="0.7" />
        <circle cx="73" cy="57" r="2.5" fill="white" opacity="0.7" />
      </>
    );
  }
  // exhausted: nearly-closed, bags prominent
  return (
    <>
      <ellipse cx="43" cy="60" rx="11" ry="6" fill="url(#eyeGrad)" />
      <ellipse cx="77" cy="60" rx="11" ry="6" fill="url(#eyeGrad)" />
      {/* Heavy eyelids */}
      <path d="M31 56 Q43 51 55 56" fill="#c4b5d4" stroke="none" opacity="0.9" />
      <path d="M65 56 Q77 51 89 56" fill="#c4b5d4" stroke="none" opacity="0.9" />
      <circle cx="43" cy="61" r="2" fill="white" opacity="0.5" />
      <circle cx="77" cy="61" r="2" fill="white" opacity="0.5" />
    </>
  );
}

function GhostMouth({ state }) {
  if (state === 'fresh') {
    return <path d="M48 80 Q60 90 72 80" fill="none" stroke="#7c5cbf" strokeWidth="3" strokeLinecap="round" />;
  }
  if (state === 'tired') {
    return <path d="M50 82 Q60 80 70 82" fill="none" stroke="#9a88c4" strokeWidth="2.5" strokeLinecap="round" />;
  }
  // exhausted: slight frown
  return <path d="M48 85 Q60 79 72 85" fill="none" stroke="#aa8fd4" strokeWidth="2.5" strokeLinecap="round" />;
}

function PhoneOffSign() {
  return (
    <motion.g
      initial={{ rotate: -5 }}
      animate={{ rotate: [-5, 5, -5] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '92px 88px' }}
    >
      {/* Stick */}
      <line x1="92" y1="102" x2="92" y2="76" stroke="#d4a96a" strokeWidth="3" strokeLinecap="round" />
      {/* Sign board */}
      <rect x="75" y="58" width="34" height="22" rx="4" fill="#f5d98a" stroke="#d4a96a" strokeWidth="1.5" />
      <text x="92" y="67" fontSize="5.5" textAnchor="middle" fill="#7c4a10" fontWeight="bold">Phone</text>
      <text x="92" y="74" fontSize="5.5" textAnchor="middle" fill="#7c4a10" fontWeight="bold">Off?</text>
    </motion.g>
  );
}

function FloatingZzz({ count }) {
  const items = Array.from({ length: count }, (_, i) => ({
    x: 95 + i * 9,
    y: 30 - i * 11,
    size: 14 - i * 3,
    delay: i * 0.7,
  }));
  return (
    <>
      {items.map((z, i) => (
        <motion.text
          key={i}
          x={z.x}
          y={z.y}
          fontSize={z.size}
          fill="#a78bfa"
          fontWeight="bold"
          opacity={0.8}
          animate={{ y: [z.y, z.y - 14, z.y], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 2.5, delay: z.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          z
        </motion.text>
      ))}
    </>
  );
}

function bodyColor(state) {
  return state === 'fresh' ? '#e8e0ff' : state === 'tired' ? '#d4cef0' : '#c8bfe8';
}
function bodyColorEdge(state) {
  return state === 'fresh' ? '#d0c5f8' : state === 'tired' ? '#b8b0e0' : '#a89dd4';
}
function glowColor(state) {
  return state === 'fresh'
    ? 'rgba(167,139,250,0.55)'
    : state === 'tired'
    ? 'rgba(139,120,200,0.40)'
    : 'rgba(100,80,180,0.25)';
}
