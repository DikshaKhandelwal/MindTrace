import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Users, Heart, Zap, ActivitySquare, Moon, Flame, Coffee, ChevronRight, Check } from 'lucide-react';
import WalkthroughTour from './components/WalkthroughTour';

// ── Pastel + black-outline newspaper palette ──────────────────────────────────
const MODULES = [
  {
    id: 'simulator',
    num: '01',
    title: 'Reality Simulator',
    subtitle: '"Practice before the real thing"',
    accent: '#16a34a',          // deep green text accent
    pastel: '#d1fae5',          // mint card fill
    stripe: '#bbf7d0',          // slightly darker for header stripe
    Icon: Brain,
    features: [
      { label: 'Generate your scenario',   done: true  },
      { label: '3D immersive mode',   done: false },
      { label: 'AI feedback reports', done: true  },
      { label: 'Adaptive personas',   done: false },
    ],
    cta: 'Start Practicing',
  },
  {
    id: 'social',
    num: '02',
    title: 'Social Connect',
    subtitle: '"You are not alone in this"',
    accent: '#b45309',
    pastel: '#fef9c3',
    stripe: '#fde68a',
    Icon: Users,
    features: [
      { label: 'Anonymous posting', done: true  },
      { label: 'Support circles',   done: false },
      { label: 'AI compassion',     done: true  },
      { label: 'Crisis resources',  done: false },
    ],
    cta: 'Join Community',
  },
  {
    id: 'inner-circle',
    num: '03',
    title: 'Inner Circle',
    subtitle: '"Five people. Maximum trust."',
    accent: '#6d28d9',
    pastel: '#ede9fe',
    stripe: '#ddd6fe',
    Icon: Heart,
    features: [
      { label: 'Max 5 people',       done: true  },
      { label: 'Mood network graph', done: false },
      { label: 'Tone guard',         done: true  },
      { label: 'Behavior insights',  done: false },
    ],
    cta: 'Enter Your Circle',
  },
  {
    id: 'clarity-engine',
    num: '04',
    title: 'Clarity Engine',
    subtitle: '"Map it, break it, clear it."',
    accent: '#be185d',
    pastel: '#fce7f3',
    stripe: '#fbcfe8',
    Icon: Zap,
    features: [
      { label: 'Thought graph',      done: true  },
      { label: 'Loop detector',      done: false },
      { label: 'Bias scanner',       done: true  },
      { label: 'Regret simulation',  done: false },
    ],
    cta: 'Debug My Thinking',
  },
  {
    id: 'mind-check',
    num: '05',
    title: 'Mind Check',
    subtitle: '"A signal — not a diagnosis."',
    accent: '#334155',
    pastel: '#f1f5f9',
    stripe: '#e2e8f0',
    Icon: ActivitySquare,
    features: [
      { label: '10 real scenarios',     done: true  },
      { label: 'No right answers',      done: false },
      { label: 'Signal, not score',     done: true  },
      { label: 'Professional guidance', done: false },
    ],
    cta: 'Check Your Signal',
  },
  {
    id: 'sleep-guardian',
    num: '06',
    title: 'Sleep Guardian',
    subtitle: '"Luna watches over your nights."',
    accent: '#3730a3',
    pastel: '#e0e7ff',
    stripe: '#c7d2fe',
    Icon: Moon,
    features: [
      { label: 'Ghost mood tracker', done: true  },
      { label: 'Caffeine half-life', done: false },
      { label: 'Moon Cookies',       done: true  },
      { label: 'AI sleep story',     done: false },
    ],
    cta: 'Ask Luna',
  },
  {
    id: 'burnout-detector',
    num: '07',
    title: 'Burnout Detector',
    subtitle: '"Your code knows before you do."',
    accent: '#c2410c',
    pastel: '#fff7ed',
    stripe: '#fed7aa',
    Icon: Flame,
    features: [
      { label: 'Real git commit analysis', done: true  },
      { label: 'Live typing speed monitor', done: true  },
      { label: '30-day signal heatmap',     done: true  },
      { label: 'GPT burnout report',        done: true  },
    ],
    cta: 'Detect My Burnout',
  },
  {
    id: 'mind-cafe',
    num: '08',
    title: 'Mind Café',
    subtitle: '"Every cup tells a story."',
    accent: '#92400e',
    pastel: '#fef3c7',
    stripe: '#fde68a',
    Icon: Coffee,
    features: [
      { label: 'Emotional brew system',   done: true  },
      { label: '6 story customers',       done: true  },
      { label: 'Night mode & self-brew',  done: true  },
      { label: 'Spill Your Thoughts',     done: true  },
    ],
    cta: 'Open the Café',
  },
];

const TICKER_ITEMS = [
  'The brain generates about 70,000 thoughts per day',
  'Sleep is when your brain clears toxins — priority, not luxury',
  'Anxiety affects 284 million people worldwide',
  'Social connection is as important to health as diet and exercise',
  'Cognitive biases affect every decision you make — even this one',
  'You can rewire your brain at any age. Neuroplasticity is real.',
  'Breathing deeply for 60 seconds lowers cortisol measurably',
  'Naming an emotion reduces its intensity by up to 50%',
  'The average person spends 6.5 years of their life dreaming',
];

// ── Live clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    , 10000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker() {
  const text = TICKER_ITEMS.join('   ✦   ') + '   ✦   ';
  return (
    <div className="overflow-hidden w-full py-2 select-none"
      style={{ background: '#111', borderBottom: '2px solid #111' }}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[text, text].map((t, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-widest text-white/80 px-4">{t}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Module card ───────────────────────────────────────────────────────────────
function ModuleCard({ mod, onEnter, idx }) {
  const [hovered, setHovered] = useState(null);
  const BLK = '2px solid #111';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.06 }}
      className="flex flex-col overflow-hidden"
      style={{
        background: mod.pastel,
        border: BLK,
        boxShadow: '3px 3px 0 #111',
      }}
    >
      {/* Stripe header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2"
        style={{ background: mod.stripe, borderBottom: BLK }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50">
              Module {mod.num}
            </span>
            {/* Count chip */}
            <span className="px-1.5 py-0.5 text-[9px] font-black text-white leading-none"
              style={{ background: '#111' }}>
              {mod.features.length}
            </span>
          </div>
          <h2 className="font-black text-xl leading-tight tracking-tight text-black"
            style={{ fontFamily: 'Georgia, serif' }}>
            {mod.title}
          </h2>
          <p className="text-[11px] italic mt-0.5" style={{ color: mod.accent }}>{mod.subtitle}</p>
        </div>
        <div className="shrink-0 w-9 h-9 flex items-center justify-center"
          style={{ background: '#fff', border: BLK }}>
          <mod.Icon size={17} style={{ color: mod.accent }} />
        </div>
      </div>

      {/* Numbered list */}
      <div className="flex-1">
        {mod.features.map((f, i) => (
          <button key={f.label}
            onClick={() => onEnter(mod.id)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
            style={{
              borderBottom: i < mod.features.length - 1 ? '1px solid rgba(0,0,0,0.12)' : 'none',
              background: hovered === i ? 'rgba(0,0,0,0.05)' : 'transparent',
            }}>
            <span className="w-5 shrink-0 text-[10px] font-black font-mono tabular-nums"
              style={{ color: f.done ? mod.accent : 'rgba(0,0,0,0.25)' }}>
              {f.done
                ? <Check size={11} strokeWidth={3} style={{ color: mod.accent }} />
                : `${String(i + 1).padStart(2,'0')}.`}
            </span>
            <span className="flex-1 text-xs font-mono text-black/70"
              style={{ color: hovered === i ? '#111' : undefined }}>
              {f.label}
            </span>
            <ChevronRight size={11}
              style={{ color: hovered === i ? mod.accent : 'rgba(0,0,0,0.20)' }} />
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => onEnter(mod.id)}
        className="w-full py-2.5 font-black text-[11px] font-mono uppercase tracking-widest transition-all text-black"
        style={{
          borderTop: BLK,
          background: hovered !== null ? mod.stripe : 'transparent',
          letterSpacing: '0.1em',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111'; }}
      >
        {mod.cta} →
      </button>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MainHub({ onEnter }) {
  const BLK = '2px solid #111';
  const [showTour, setShowTour] = useState(false);

  return (
    <div className="hub-bg min-h-screen flex flex-col">

      {/* ── WALKTHROUGH TOUR OVERLAY ── */}
      <AnimatePresence>
        {showTour && <WalkthroughTour onClose={() => setShowTour(false)} />}
      </AnimatePresence>

      {/* ── MASTHEAD ── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full"
        style={{ borderBottom: '3px solid #111', background: '#faf7f2' }}
      >
        {/* Top bar — date + tagline */}
        <div className="flex items-center justify-between px-6 py-1.5 text-[10px] font-mono text-black/40 uppercase tracking-widest"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
          <span>Est. 2025 · MindTrace Mental Toolkit</span>
          <span className="flex items-center gap-3">
            <button
              onClick={() => setShowTour(true)}
              className="flex items-center gap-1 px-2 py-0.5 font-black font-mono text-[9px] uppercase tracking-widest text-black/60 hover:text-black transition-colors"
              style={{ border: '1.5px solid rgba(0,0,0,0.18)', background: '#fff' }}
            >
              ▶ Tour
            </button>
            <LiveClock />
            <span>· March 2026</span>
          </span>
        </div>

        {/* Logo row */}
        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div>
            <h1 className="font-black text-black leading-none"
              style={{ fontSize: 'clamp(2rem,5vw,3.6rem)', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
              MindTrace
            </h1>
            <p className="text-[15px] font-mono text-black/50 mt-1 italic">
              Eight tools for your inner world — curated &amp; built for real life.
            </p>
          </div>

          {/* Stat chips — right side */}
          <div className="hidden sm:flex flex-col gap-1.5 items-end shrink-0">
            {[
              { val: '24K+', label: 'users' },
              { val: 'GPT-4o', label: 'powered' },
              { val: '8', label: 'modules' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black font-mono"
                style={{ border: BLK, background: '#fff', boxShadow: '1.5px 1.5px 0 #111' }}>
                <span className="text-black">{s.val}</span>
                <span className="text-black/40 font-normal">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── SECTION LABEL ── */}
      <div className="px-6 pt-6 pb-3 max-w-6xl w-full mx-auto flex items-center gap-4">
        <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-black/40">
          All Modules
        </span>
        <div className="flex-1 h-px bg-black/15" />
        <span className="text-[10px] font-mono text-black/30 italic">tap any row to enter</span>
      </div>

      {/* ── CARD GRID ── */}
      <div className="px-6 pb-10 max-w-6xl w-full mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5 flex-1">
        {MODULES.map((mod, i) => (
          <ModuleCard key={mod.id} mod={mod} onEnter={onEnter} idx={i} />
        ))}
      </div>

      {/* ── THOUGHT CLOUD — above footer, right-aligned ── */}
      <div className="w-full px-6 flex justify-end pt-6 pb-2">
        <motion.div
          className="relative flex flex-col items-end"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <button
            onClick={() => onEnter('joy')}
            className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-black font-mono uppercase tracking-widest transition-all text-black"
            style={{
              border: BLK,
              background: '#fce7f3',
              boxShadow: '2px 2px 0 #111',
              borderRadius: '999px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fce7f3'; e.currentTarget.style.boxShadow = 'none'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fce7f3'; e.currentTarget.style.color = '#111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111'; }}
          >
            💗 Need a moment?
          </button>
          {/* Thought dots */}
          <div className="flex flex-col items-end pr-5" style={{ gap: 3, marginTop: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fce7f3', border: BLK }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fce7f3', border: BLK }} />
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#fce7f3', border: BLK }} />
          </div>
        </motion.div>
      </div>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full px-6 py-4 flex items-center justify-center"
        style={{ borderTop: '2px solid #111', background: '#f0ede6' }}
      >
        <p className="text-[10px] font-mono text-black/35">
          All conversations are private. Nothing is identified or stored.
        </p>
      </motion.footer>

    </div>
  );
}
