/**
 * MicroChallenges.jsx
 * Calming micro-challenges that award moon cookies on completion.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayChallenges, completeChallenge } from '../data/sleepStore';
import { createAmbient } from '../data/ambientAudio';

// ── Challenge definitions ─────────────────────────────────────────────────────
export const CHALLENGES = [
  {
    id: 'still60',
    emoji: '🧘',
    title: 'Stay Still',
    tagline: 'No movement for 60 seconds',
    hint: 'Find a comfortable position, close your eyes, and don\'t move.',
    type: 'timer',
    duration: 60,
    reward: 5,
    color: '#818cf8',
  },
  {
    id: 'breathe5',
    emoji: '🌬️',
    title: 'Follow 5 Breaths',
    tagline: 'Breathe with the circle',
    hint: 'Inhale as it expands — hold — exhale as it shrinks. Five rounds.',
    type: 'breath',
    phases: [
      { label: 'Breathe in',  duration: 4, scale: 1.4 },
      { label: 'Hold',        duration: 2, scale: 1.4 },
      { label: 'Breathe out', duration: 6, scale: 0.7 },
    ],
    rounds: 5,
    reward: 8,
    color: '#34d399',
  },
  {
    id: 'listen90',
    emoji: '👂',
    title: 'Listen Only',
    tagline: 'Close your eyes, just listen',
    hint: 'Close your eyes now. For 90 seconds, only notice the sounds around you.',
    type: 'listen',
    duration: 90,
    ambient: 'rain',
    reward: 5,
    color: '#c084fc',
  },
  {
    id: '478',
    emoji: '✨',
    title: '4-7-8 Breathing',
    tagline: 'The classic sleep breath',
    hint: 'Breathe in 4s → hold 7s → breathe out 8s. Three cycles.',
    type: 'breath',
    phases: [
      { label: 'Breathe in',  duration: 4, scale: 1.45 },
      { label: 'Hold',        duration: 7, scale: 1.45 },
      { label: 'Breathe out', duration: 8, scale: 0.65 },
    ],
    rounds: 3,
    reward: 10,
    color: '#f472b6',
  },
  {
    id: 'scan60',
    emoji: '🌊',
    title: 'Body Scan',
    tagline: 'Soften each part of your body',
    hint: 'We\'ll visit each body part. Just notice — no need to change anything.',
    type: 'scan',
    parts: [
      { label: 'Feet & toes',      emoji: '🦶', duration: 10 },
      { label: 'Legs & knees',     emoji: '🦵', duration: 10 },
      { label: 'Hips & belly',     emoji: '💛', duration: 10 },
      { label: 'Chest & breath',   emoji: '💙', duration: 10 },
      { label: 'Shoulders & arms', emoji: '💪', duration: 10 },
      { label: 'Face & jaw',       emoji: '😌', duration: 10 },
    ],
    reward: 7,
    color: '#a5f3fc',
  },
];

// ── Ring helper ───────────────────────────────────────────────────────────────
const R = 44;
const CIRC = 2 * Math.PI * R;

function CountdownRing({ pct, color, size = 110 }) {
  const offset = CIRC * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={R} fill="none"
        stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={R}
        fill="none" stroke={color} strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={CIRC}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.4, ease: 'linear' }}
      />
    </svg>
  );
}

// ── TIMER challenge ───────────────────────────────────────────────────────────
function TimerChallenge({ challenge, onDone }) {
  const [remaining, setRemaining] = useState(challenge.duration);
  const total = challenge.duration;

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onDone]);

  const pct = remaining / total;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <CountdownRing pct={pct} color={challenge.color} />
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-mono font-bold text-white">{remaining}</span>
          <span className="text-[9px] text-indigo-400 font-mono tracking-widest">SEC</span>
        </div>
      </div>
      <p className="text-indigo-300 text-xs font-mono text-center max-w-[220px] leading-relaxed">
        Stay perfectly still…
      </p>
    </div>
  );
}

// ── BREATH challenge ──────────────────────────────────────────────────────────
function BreathChallenge({ challenge, onDone }) {
  const [round, setRound]   = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick]     = useState(0);

  const phase = challenge.phases[phaseIdx];
  const totalRounds = challenge.rounds;

  useEffect(() => {
    if (tick >= phase.duration) {
      const next = phaseIdx + 1;
      if (next >= challenge.phases.length) {
        if (round >= totalRounds) { onDone(); return; }
        setRound(r => r + 1);
        setPhaseIdx(0);
      } else {
        setPhaseIdx(next);
      }
      setTick(0);
      return;
    }
    const id = setTimeout(() => setTick(t => t + 1), 1000);
    return () => clearTimeout(id);
  }, [tick, phaseIdx, round, phase, totalRounds, challenge.phases.length, onDone]);

  const phasePct = (phase.duration - tick) / phase.duration;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Breathing circle */}
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        <motion.div
          className="rounded-full"
          style={{ background: `radial-gradient(circle, ${challenge.color}55, ${challenge.color}22)`, border: `2px solid ${challenge.color}66` }}
          animate={{ width: 90 * phase.scale, height: 90 * phase.scale }}
          transition={{ duration: phase.duration * 0.92, ease: phaseIdx === 2 ? 'easeIn' : 'easeOut' }}
        />
        <div className="absolute flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: challenge.color }}>
            {phase.label}
          </span>
          <span className="text-white font-mono font-bold text-lg">{phase.duration - tick}</span>
        </div>
      </div>

      {/* Round dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{ background: i < round ? challenge.color : 'rgba(255,255,255,0.15)' }}
          />
        ))}
      </div>
      <p className="text-indigo-400 text-[10px] font-mono">
        Round {round} of {totalRounds}
      </p>

      {/* Progress ring */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <CountdownRing pct={phasePct} color={challenge.color} />
      </div>
    </div>
  );
}

// ── LISTEN challenge ──────────────────────────────────────────────────────────
function ListenChallenge({ challenge, onDone }) {
  const [remaining, setRemaining] = useState(challenge.duration);
  const ambientRef = useRef(null);

  useEffect(() => {
    ambientRef.current = createAmbient(challenge.ambient ?? 'rain');
    return () => ambientRef.current?.stop();
  }, [challenge.ambient]);

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onDone]);

  const pct = remaining / challenge.duration;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex items-center justify-center">
        <CountdownRing pct={pct} color={challenge.color} />
        <span className="absolute text-2xl">👂</span>
      </div>
      <div className="text-center space-y-1">
        <p className="text-white font-mono text-sm font-semibold">Eyes closed.</p>
        <p className="text-indigo-300 text-xs font-mono">Only listen.</p>
        <p className="text-indigo-500 text-[9px] font-mono">{remaining}s remaining</p>
      </div>
    </div>
  );
}

// ── SCAN challenge ────────────────────────────────────────────────────────────
function ScanChallenge({ challenge, onDone }) {
  const [partIdx, setPartIdx]   = useState(0);
  const [tick, setTick]         = useState(0);
  const parts = challenge.parts;
  const part  = parts[partIdx];

  useEffect(() => {
    if (tick >= part.duration) {
      if (partIdx + 1 >= parts.length) { onDone(); return; }
      setPartIdx(i => i + 1);
      setTick(0);
      return;
    }
    const id = setTimeout(() => setTick(t => t + 1), 1000);
    return () => clearTimeout(id);
  }, [tick, partIdx, part.duration, parts.length, onDone]);

  const pct = (part.duration - tick) / part.duration;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Body part progress */}
      <div className="relative flex items-center justify-center">
        <CountdownRing pct={pct} color={challenge.color} />
        <span className="absolute text-2xl">{part.emoji}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={partIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-center"
        >
          <p className="text-white font-mono text-sm font-bold">{part.label}</p>
          <p className="text-indigo-400 text-[10px] font-mono mt-0.5">
            Soften… let go…
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {parts.map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
            style={{ background: i <= partIdx ? challenge.color : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
    </div>
  );
}

// ── Active challenge modal ────────────────────────────────────────────────────
function ChallengeRunner({ challenge, onDone, onExit }) {
  const [finished, setFinished] = useState(false);

  function handleDone() {
    setFinished(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,8,30,0.93)', backdropFilter: 'blur(16px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
        style={{ background: 'rgba(30,22,60,0.95)', border: '1px solid rgba(129,140,248,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="px-6 py-5 text-center border-b border-indigo-800/30">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <span className="text-xl">{challenge.emoji}</span>
            <h3 className="font-mono font-bold text-white text-base tracking-wide">{challenge.title}</h3>
          </div>
          <p className="text-indigo-400 text-[10px] font-mono italic">&ldquo;{challenge.tagline}&rdquo;</p>
        </div>

        {/* Challenge body */}
        <div className="px-6 py-8 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="done"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                  className="text-5xl"
                >
                  🍪
                </motion.div>
                <div className="text-center">
                  <p className="text-white font-mono font-bold text-lg">Done!</p>
                  <p className="text-indigo-300 text-xs font-mono mt-1">
                    +{challenge.reward} moon cookie{challenge.reward !== 1 ? 's' : ''} earned
                  </p>
                </div>
                <button
                  onClick={() => onDone(challenge.id, challenge.reward)}
                  className="mt-2 px-8 py-2.5 rounded-2xl font-mono font-bold text-xs text-white"
                  style={{ background: `linear-gradient(135deg, ${challenge.color}cc, ${challenge.color})` }}
                >
                  Collect reward →
                </button>
              </motion.div>
            ) : (
              <motion.div key="running" className="w-full flex flex-col items-center gap-4">
                {challenge.type === 'timer'  && <TimerChallenge  challenge={challenge} onDone={handleDone} />}
                {challenge.type === 'breath' && <BreathChallenge challenge={challenge} onDone={handleDone} />}
                {challenge.type === 'listen' && <ListenChallenge challenge={challenge} onDone={handleDone} />}
                {challenge.type === 'scan'   && <ScanChallenge   challenge={challenge} onDone={handleDone} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!finished && (
          <div className="px-6 pb-5 text-center">
            <button
              onClick={onExit}
              className="text-indigo-600 text-xs font-mono hover:text-indigo-400 transition-colors"
            >
              ✕ Exit challenge
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MicroChallenges({ onCookiesChange }) {
  const [completedIds, setCompletedIds] = useState(() => getTodayChallenges());
  const [activeId, setActiveId]         = useState(null);

  const active = CHALLENGES.find(c => c.id === activeId);

  function handleComplete(id, reward) {
    const updated = completeChallenge(id, reward);
    setCompletedIds(updated.completedChallenges ?? []);
    onCookiesChange?.();
    setActiveId(null);
  }

  const totalCookies = CHALLENGES
    .filter(c => completedIds.includes(c.id))
    .reduce((sum, c) => sum + c.reward, 0);

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 mt-1">
        <span className="font-mono text-indigo-200 text-sm font-bold tracking-widest uppercase">
          Micro Challenges
        </span>
        <span
          className="px-1.5 py-0.5 rounded text-[9px] font-black"
          style={{ background: 'rgba(129,140,248,0.80)', color: '#fff' }}
        >
          {CHALLENGES.length}
        </span>
        {totalCookies > 0 && (
          <span className="ml-auto text-xs font-mono text-indigo-400">
            🍪 {totalCookies} earned today
          </span>
        )}
      </div>

      <p className="text-indigo-500 text-[10px] font-mono italic mb-5">
        &ldquo;Small moments of calm, rewarded.&rdquo;
      </p>

      {/* Challenge list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(129,140,248,0.18)', background: 'rgba(30,22,60,0.50)' }}
      >
        {CHALLENGES.map((c, i) => {
          const done = completedIds.includes(c.id);
          return (
            <motion.button
              key={c.id}
              onClick={() => !done && setActiveId(c.id)}
              whileHover={!done ? { x: 2 } : {}}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left group"
              style={{
                borderBottom: i < CHALLENGES.length - 1 ? '1px solid rgba(129,140,248,0.10)' : 'none',
                cursor: done ? 'default' : 'pointer',
                opacity: done ? 0.7 : 1,
              }}
            >
              {/* Number */}
              <span
                className="text-[10px] font-black font-mono tabular-nums w-5 shrink-0 text-right"
                style={{ color: 'rgba(129,140,248,0.45)' }}
              >
                {String(i + 1).padStart(2, '0')}.
              </span>

              {/* Emoji circle */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base"
                style={{ background: `${c.color}22`, border: `1px solid ${c.color}44` }}
              >
                {done ? '✅' : c.emoji}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-mono font-bold text-xs">{c.title}</p>
                <p className="text-indigo-500 text-[10px] font-mono italic">{c.tagline}</p>
              </div>

              {/* Reward */}
              <div className="shrink-0 flex items-center gap-1.5">
                {done ? (
                  <span className="text-xs font-mono" style={{ color: c.color }}>+{c.reward}🍪</span>
                ) : (
                  <>
                    <span className="text-[9px] font-mono text-indigo-600">{c.reward} 🍪</span>
                    <span className="text-xs font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: 'rgba(129,140,248,0.40)' }}>→</span>
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* All done banner */}
      {CHALLENGES.every(c => completedIds.includes(c.id)) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-center rounded-2xl px-4 py-4"
          style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)' }}
        >
          <p className="text-indigo-300 font-mono text-sm font-bold">All challenges complete ✨</p>
          <p className="text-indigo-500 font-mono text-xs mt-0.5 italic">Luna is very proud of you tonight.</p>
        </motion.div>
      )}

      {/* Active challenge overlay */}
      <AnimatePresence>
        {active && (
          <ChallengeRunner
            key={active.id}
            challenge={active}
            onDone={handleComplete}
            onExit={() => setActiveId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
