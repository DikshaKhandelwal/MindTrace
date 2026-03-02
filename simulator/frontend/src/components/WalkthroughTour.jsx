/**
 * WalkthroughTour.jsx
 * Full-screen in-app guided tour with browser TTS narration.
 * Triggered by the "▶ Tour" button on the hub.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Pause, Play, Volume2, VolumeX } from 'lucide-react';

// ── Tour steps ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'intro',
    num: null,
    title: 'MindTrace',
    subtitle: 'Eight tools for your inner world',
    accent: '#111',
    pastel: '#faf7f2',
    stripe: '#f0ede6',
    emoji: '🧭',
    points: [
      'AI-powered, privacy-first',
      'No accounts, no tracking',
      'Built for real emotional situations',
      'Eight modules — one for every need',
    ],
    narration: `Welcome to MindTrace — a mental wellness toolkit built for real life.
Not therapy. Not a mood diary. Eight interactive modules that help you practise difficult conversations,
read your own emotions, sleep better, and check in honestly with yourself — all powered by AI.
Let me walk you through each one.`,
  },
  {
    id: 'simulator',
    num: '01',
    title: 'Reality Simulator',
    subtitle: '"Practise before the real thing"',
    accent: '#16a34a',
    pastel: '#d1fae5',
    stripe: '#bbf7d0',
    emoji: '🧠',
    points: [
      'Type any difficult conversation',
      'AI plays a realistic persona — it pushes back',
      'Full coaching report: assertiveness, empathy, clarity',
      'Better responses shown from your own conversation',
    ],
    narration: `The Reality Simulator lets you practise emotionally charged conversations before you have to live them.
Type a situation — asking your boss for a raise, setting a boundary with a parent, resolving a conflict —
and the AI builds a full persona and scenario around it. It responds the way a real person would — sometimes difficult, sometimes defensive.
When you finish, you get a detailed coaching report: scored on assertiveness, empathy, and clarity,
with specific moments from your conversation highlighted and better alternatives shown.`,
  },
  {
    id: 'social',
    num: '02',
    title: 'Social Connect',
    subtitle: '"You are not alone in this"',
    accent: '#d97706',
    pastel: '#fef3c7',
    stripe: '#fde68a',
    emoji: '🤝',
    points: [
      'Fully anonymous community feed',
      'Topic-based Support Circles',
      'Daily mood check-in shared with the community',
      'Crisis lines and breathing tools always accessible',
    ],
    narration: `Social Connect is an anonymous community space.
Post what you're going through without your name ever being attached.
Join Support Circles around topics like grief, anxiety, or relationships — and read what others are experiencing.
There's a daily mood check-in shared across the whole community, so you can see you're not the only one having a hard day.
The resource hub keeps crisis support lines and breathing exercises one tap away.`,
  },
  {
    id: 'inner-circle',
    num: '03',
    title: 'Inner Circle',
    subtitle: '"Your relationships, mapped"',
    accent: '#0369a1',
    pastel: '#e0f2fe',
    stripe: '#bae6fd',
    emoji: '💛',
    points: [
      'Add the key people in your life',
      'Track how each relationship feels over time',
      'Write private support notes — they never see them',
      'Spot patterns before they become problems',
    ],
    narration: `Inner Circle is for the relationships that matter most.
Add the people in your life, and track privately how those relationships make you feel over weeks and months.
Write notes about what you appreciate, what's bothering you, what you want to say — completely private.
They never see it. It's not about them. It's about understanding your own emotional patterns in relationships.`,
  },
  {
    id: 'clarity-engine',
    num: '04',
    title: 'Clarity Engine',
    subtitle: '"Map it, break it, clear it"',
    accent: '#be185d',
    pastel: '#fce7f3',
    stripe: '#fbcfe8',
    emoji: '⚡',
    points: [
      'Type a thought — AI builds a visual graph',
      'Loops, contradictions, and biases surface automatically',
      'Regret simulator: walk through decisions before making them',
      'See exactly where your thinking gets stuck',
    ],
    narration: `The Clarity Engine maps your thinking.
Type what's on your mind — a decision you can't make, a loop you keep hitting — and it builds an interactive thought graph.
Loops, contradictions, and cognitive biases become visible as nodes and connections.
There's also a regret simulator: walk through a decision and see the emotional cost of each path
before you commit to it. It doesn't tell you what to do — it shows you what you already know.`,
  },
  {
    id: 'mind-check',
    num: '05',
    title: 'Mind Check',
    subtitle: '"A signal — not a diagnosis"',
    accent: '#334155',
    pastel: '#f1f5f9',
    stripe: '#e2e8f0',
    emoji: '📊',
    points: [
      '10 real-life emotional scenarios',
      'No right or wrong answers',
      'Reads your emotional position — not your score',
      'Gentle summary and optional guidance after',
    ],
    narration: `Mind Check is a ten-scenario emotional signal test.
Each scenario puts you in a real situation and you respond how you actually would.
There are no right answers. It's not scoring you against a rubric — it's reading where you are emotionally right now.
The result is a quiet signal: here's what this suggests about your state of mind today.
It ends with a gentle summary and, if you want it, some guidance on what to do next.`,
  },
  {
    id: 'sleep-guardian',
    num: '06',
    title: 'Sleep Guardian',
    subtitle: '"Luna watches over your nights"',
    accent: '#3730a3',
    pastel: '#e0e7ff',
    stripe: '#c7d2fe',
    emoji: '🌙',
    points: [
      'Pick your mood + a place — Luna writes your bedtime story',
      'Story read aloud with ambient sound',
      'Moon Cookie ritual, caffeine half-life tracker',
      'Ghost mood tracker for late-night logging',
    ],
    narration: `Sleep Guardian is built around Luna — your nighttime companion.
Tell her how you're feeling and pick a place: a beach, the mountains, outer space.
She writes you a personalised bedtime story and reads it aloud, while ambient sound plays in the background.
There's a Moon Cookie ritual for winding down with intention, a caffeine half-life tracker
that tells you when your last coffee will stop affecting your sleep, and a ghost mood tracker
for nights when you just want to log how you feel without overthinking it.`,
  },
  {
    id: 'burnout-detector',
    num: '07',
    title: 'Burnout Detector',
    subtitle: '"Your code knows before you do."',
    accent: '#c2410c',
    pastel: '#fff7ed',
    stripe: '#fed7aa',
    emoji: '🔥',
    points: [
      'Analyses real git commit patterns for distress signals',
      'Live typing speed monitor — detects fatigue and hesitation',
      'Activity log — manual check-ins across energy and focus',
      '30-day signal heatmap + GPT burnout report',
    ],
    narration: `The Burnout Detector is a developer wellness tool that reads signals you don't notice yourself.
It analyses your actual git commit history — late-night pushes, erratic messages, frequency drops — for early burnout patterns.
It monitors your typing speed in real time, detecting hesitation and fatigue.
You log daily signals across energy, focus, and mood.
All of this feeds into a 30-day signal timeline and a GPT burnout report
that tells you exactly where the stress is coming from — and what to do about it.`,
  },
  {
    id: 'mind-cafe',
    num: '08',
    title: 'Mind Café',
    subtitle: '"Read people. Make the right drink."',
    accent: '#92400e',
    pastel: '#fef3c7',
    stripe: '#fde68a',
    emoji: '☕',
    points: [
      'You\'re the barista — customers carry real emotional weight',
      'Listen carefully — the drink they need is in what they say',
      'GPT generates every customer fresh — no two visits the same',
      'Spill Machine: pour your thoughts, get a gentle reframe',
    ],
    narration: `Mind Café is the most immersive module. You're the barista.
Customers walk in carrying real emotional weight — each one generated fresh by GPT, so no two visits are ever the same.
They talk. You listen. And from what they say — not what they order — you build them a drink that matches where they are.
Getting it right takes emotional attunement. It's quietly satisfying when you do.
There's also a Spill Machine: type your own raw thoughts into it and get a gentle, honest reframe back.`,
  },
  {
    id: 'outro',
    num: null,
    title: 'That\'s MindTrace',
    subtitle: 'Private. Honest. Built for real life.',
    accent: '#111',
    pastel: '#faf7f2',
    stripe: '#f0ede6',
    emoji: '💗',
    points: [
      'Nothing stored, nothing identified',
      'Works offline for most features',
      'Use one module or all eight',
      'Whenever you need it — it\'s here',
    ],
    narration: `That's MindTrace.
Eight tools, all private. Nothing is stored or identified — every session stays on your device.
Use whichever module fits what you're going through right now.
There's no right order, no progress bar to fill.
The only thing it asks is that you show up honestly.
Thank you for watching.`,
  },
];

// ── TTS helpers ────────────────────────────────────────────────────────────────
function speak(text, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return null; }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text.replace(/\n/g, ' '));
  utter.rate   = 0.88;
  utter.pitch  = 1.0;
  utter.volume = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    'Google UK English Female',
    'Microsoft Hazel Online (Natural) - English (United Kingdom)',
    'Samantha', 'Karen', 'Victoria',
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) { utter.voice = v; break; }
  }
  utter.onend = () => onEnd?.();
  window.speechSynthesis.speak(utter);
  return utter;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function WalkthroughTour({ onClose }) {
  const [step, setStep]       = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted]     = useState(false);
  const [pointIdx, setPointIdx] = useState(0);
  const autoRef   = useRef(null);
  const utterRef  = useRef(null);
  const current   = STEPS[step];
  const isLast    = step === STEPS.length - 1;

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    clearTimeout(autoRef.current);
  }, []);

  const goTo = useCallback((idx) => {
    stopSpeech();
    setStep(idx);
    setPointIdx(0);
    setPlaying(true);
  }, [stopSpeech]);

  const next = useCallback(() => {
    if (isLast) { stopSpeech(); onClose(); }
    else goTo(step + 1);
  }, [isLast, step, goTo, stopSpeech, onClose]);

  const prev = useCallback(() => {
    if (step > 0) goTo(step - 1);
  }, [step, goTo]);

  // TTS + bullet point animation per step
  useEffect(() => {
    setPointIdx(0);
    if (muted || !playing) return;
    // stagger bullet points
    const s = STEPS[step];
    s.points.forEach((_, i) => {
      const tid = setTimeout(() => setPointIdx(i + 1), i * 900 + 400);
      return () => clearTimeout(tid);
    });
    // Start TTS after small delay
    const tid = setTimeout(() => {
      utterRef.current = speak(s.narration, () => {
        if (playing) {
          autoRef.current = setTimeout(() => next(), 1200);
        }
      });
    }, 300);
    return () => {
      clearTimeout(tid);
      stopSpeech();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, muted, playing]);

  function togglePlay() {
    if (playing) {
      stopSpeech();
      setPlaying(false);
    } else {
      setPlaying(true);
    }
  }

  function toggleMute() {
    if (!muted) {
      window.speechSynthesis?.cancel();
    }
    setMuted(m => !m);
  }

  const BLK = '2px solid #111';
  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: current.pastel, fontFamily: 'Georgia, serif' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: BLK, background: current.stripe }}>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black font-mono uppercase tracking-[0.25em] text-black/40">
            MindTrace · Tour
          </span>
          {current.num && (
            <span className="px-1.5 py-0.5 text-[9px] font-black font-mono text-white"
              style={{ background: current.accent }}>
              {current.num} / 08
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute}
            className="p-1.5 transition-opacity hover:opacity-60"
            title={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button onClick={togglePlay}
            className="p-1.5 transition-opacity hover:opacity-60"
            title={playing ? 'Pause' : 'Resume'}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button onClick={() => { stopSpeech(); onClose(); }}
            className="p-1.5 transition-opacity hover:opacity-60"
            title="Exit tour">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full h-1" style={{ background: 'rgba(0,0,0,0.08)' }}>
        <motion.div
          className="h-full"
          style={{ background: current.accent }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* ── Step dots ── */}
      <div className="flex justify-center gap-1.5 py-3">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)}
            className="rounded-full transition-all"
            style={{
              width: i === step ? 18 : 6,
              height: 6,
              background: i === step ? current.accent : i < step ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.38 }}
            className="w-full"
          >
            {/* Emoji */}
            <motion.div
              className="text-6xl mb-5 text-center"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {current.emoji}
            </motion.div>

            {/* Title block */}
            <div className="mb-6 text-center">
              <h2 className="font-black text-black leading-none mb-1"
                style={{ fontSize: 'clamp(2rem,6vw,3.2rem)', letterSpacing: '-0.02em' }}>
                {current.title}
              </h2>
              <p className="text-sm italic" style={{ color: current.accent }}>
                {current.subtitle}
              </p>
            </div>

            {/* Feature points */}
            <div className="space-y-2.5">
              {current.points.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: i < pointIdx ? 1 : 0, x: i < pointIdx ? 0 : -16 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 px-4 py-2.5"
                  style={{ border: BLK, background: 'rgba(255,255,255,0.6)', boxShadow: '2px 2px 0 #111' }}
                >
                  <span className="shrink-0 w-4 h-4 mt-0.5 rounded-full"
                    style={{ background: current.accent, border: '1.5px solid #111' }} />
                  <span className="text-sm font-mono text-black">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Nav controls ── */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderTop: BLK, background: current.stripe }}>
        <button
          onClick={prev}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2 font-black font-mono text-[11px] uppercase tracking-widest transition-all disabled:opacity-25"
          style={{ border: BLK, background: '#fff', boxShadow: step > 0 ? '2px 2px 0 #111' : 'none' }}
        >
          <ChevronLeft size={13} /> Back
        </button>

        <span className="text-[10px] font-mono text-black/35">
          {step + 1} of {STEPS.length}
        </span>

        <button
          onClick={next}
          className="flex items-center gap-1.5 px-4 py-2 font-black font-mono text-[11px] uppercase tracking-widest text-white transition-all"
          style={{ border: BLK, background: isLast ? '#111' : current.accent, boxShadow: '2px 2px 0 #111' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {isLast ? 'Finish' : 'Next'} <ChevronRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
