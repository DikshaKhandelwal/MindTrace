import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { NODE_TYPES } from '../data/engine';

function FearMeter({ fearPct }) {
  const level = fearPct > 70 ? 'Critical' : fearPct > 50 ? 'High' : fearPct > 30 ? 'Moderate' : 'Low';
  const color  = fearPct > 70 ? '#f472b6' : fearPct > 50 ? '#fb923c' : fearPct > 30 ? '#fde68a' : '#86efac';
  const label  = fearPct > 70
    ? 'Fear is dominating your reasoning. Emotions are louder than evidence right now.'
    : fearPct > 50
    ? 'Fear has significant influence. Some logic and opportunity thinking is present but muted.'
    : fearPct > 30
    ? 'Balanced mix — fear is present but not overwhelming.'
    : 'Your thinking is mostly grounded and forward-looking.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 mb-4"
      style={{ background: 'rgba(255,240,248,0.70)', border: '1px solid rgba(244,114,182,0.18)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(160,60,90,0.55)' }}>
            Fear Amplification Meter
          </span>
          <div className="text-2xl font-black mt-0.5" style={{ color }}>
            {fearPct}% <span className="text-lg font-bold opacity-80">{level}</span>
          </div>
        </div>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
          style={{ background: `${color}22`, border: `2px solid ${color}55` }}
        >
          {fearPct > 60 ? '😰' : fearPct > 30 ? '😐' : '😌'}
        </div>
      </div>

      {/* Bar */}
      <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(244,114,182,0.10)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fearPct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'rgba(100,30,60,0.65)' }}>{label}</p>

      {fearPct > 60 && (
        <div className="mt-3 px-4 py-2.5 rounded-2xl text-xs font-medium"
          style={{ background: 'rgba(244,114,182,0.10)', border: '1px solid rgba(244,114,182,0.22)', color: 'rgba(131,24,67,0.70)' }}>
          💡 Try separating: <em>What do I emotionally feel?</em> vs. <em>What do I actually know to be true?</em>
        </div>
      )}
    </motion.div>
  );
}

function BiasCard({ bias, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl mb-2.5 overflow-hidden cursor-pointer"
      style={{ background: `${bias.color}18`, border: `1px solid ${bias.color}44` }}
      onClick={() => setOpen(v => !v)}
    >
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bias.color, boxShadow: `0 0 8px ${bias.color}` }} />
          <span className="font-bold text-sm" style={{ color: 'rgba(70,10,40,0.82)' }}>{bias.label}</span>
        </div>
        {open ? <ChevronUp size={14} style={{ color: bias.color }} /> : <ChevronDown size={14} style={{ color: bias.color }} />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2">
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(100,30,60,0.72)' }}>{bias.desc}</p>
              <div className="flex items-start gap-2 text-xs leading-relaxed px-3 py-2 rounded-xl"
                style={{ background: `${bias.color}14`, color: 'rgba(80,20,50,0.65)' }}>
                💡 <span>{bias.tip}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SplitView({ split }) {
  const totalE = split.emotionalPct;
  const totalL = split.logicalPct;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-3xl p-6 mb-4"
      style={{ background: 'rgba(255,240,248,0.70)', border: '1px solid rgba(196,181,253,0.25)', backdropFilter: 'blur(12px)' }}
    >
      <h3 className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: 'rgba(120,60,100,0.55)' }}>
        Emotional vs Logical Split
      </h3>
      <div className="flex gap-0.5 h-8 rounded-xl overflow-hidden mb-3">
        <motion.div
          initial={{ flex: 0 }} animate={{ flex: totalE }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="flex items-center justify-center text-xs font-bold text-white rounded-l-xl"
          style={{ background: 'linear-gradient(90deg, #f472b6, #fb7185)' }}
        >
          {totalE > 15 ? `${totalE}% E` : ''}
        </motion.div>
        <motion.div
          initial={{ flex: 0 }} animate={{ flex: totalL }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="flex items-center justify-center text-xs font-bold text-white rounded-r-xl"
          style={{ background: 'linear-gradient(90deg, #818cf8, #93c5fd)' }}
        >
          {totalL > 15 ? `${totalL}% L` : ''}
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-2xl p-4" style={{ background: 'rgba(244,114,182,0.10)', border: '1px solid rgba(244,114,182,0.18)' }}>
          <div className="text-xs font-bold mb-2" style={{ color: '#f472b6' }}>🌸 Emotional ({totalE}%)</div>
          {split.emotional.length === 0
            ? <p className="text-xs" style={{ color: 'rgba(160,60,90,0.50)' }}>No emotional nodes</p>
            : split.emotional.map((n, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: NODE_TYPES[n.type]?.color }} />
                <span className="text-xs" style={{ color: 'rgba(100,30,60,0.72)' }}>{n.label.length > 22 ? n.label.slice(0,20)+'…' : n.label}</span>
              </div>
            ))
          }
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(147,197,253,0.10)', border: '1px solid rgba(147,197,253,0.18)' }}>
          <div className="text-xs font-bold mb-2" style={{ color: '#93c5fd' }}>💙 Logical ({totalL}%)</div>
          {split.logical.length === 0
            ? <p className="text-xs" style={{ color: 'rgba(80,100,160,0.50)' }}>No logic nodes yet</p>
            : split.logical.map((n, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: NODE_TYPES[n.type]?.color }} />
                <span className="text-xs" style={{ color: 'rgba(60,60,100,0.72)' }}>{n.label.length > 22 ? n.label.slice(0,20)+'…' : n.label}</span>
              </div>
            ))
          }
        </div>
      </div>
      {totalE > totalL + 20 && (
        <p className="text-xs mt-3 text-center font-medium" style={{ color: 'rgba(131,24,67,0.60)' }}>
          Imbalance detected — your emotional reasoning is significantly outweighing logical analysis.
        </p>
      )}
    </motion.div>
  );
}

function ReframeEngine({ reframes }) {
  const [current, setCurrent] = useState(0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-3xl p-6 mb-4"
      style={{ background: 'rgba(255,240,248,0.70)', border: '1px solid rgba(134,239,172,0.28)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(40,120,80,0.65)' }}>
          🔁 Thought Reframing Engine
        </h3>
        <button
          onClick={() => setCurrent(i => (i + 1) % reframes.length)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
          style={{ background: 'rgba(134,239,172,0.18)', color: 'rgba(20,100,60,0.80)', border: '1px solid rgba(134,239,172,0.35)' }}
        >
          <RefreshCw size={11} />
          Next reframe
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-xl font-bold leading-snug"
          style={{ color: 'rgba(20,90,50,0.88)' }}
        >
          "{reframes[current]}"
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-1.5 mt-4">
        {reframes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === current ? 24 : 6,
              background: i === current ? '#86efac' : 'rgba(134,239,172,0.30)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function MentalLoadMeter({ nodes }) {
  const count   = nodes.length;
  const overlap = count > 8 ? 'high' : count > 5 ? 'medium' : 'low';
  const fearW   = nodes.filter(n => n.type === 'fear').length * 2;
  const totalWeight = count + fearW;
  const load    = Math.min(100, Math.round((totalWeight / 20) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-3xl p-5 mb-4"
      style={{ background: 'rgba(255,240,248,0.70)', border: '1px solid rgba(253,230,138,0.35)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: 'rgba(130,100,20,0.65)' }}>
            🧠 Mental Load Meter
          </h3>
          <p className="text-2xl font-black" style={{ color: load > 65 ? '#f472b6' : '#fde68a' }}>
            {load}% <span className="text-base font-bold opacity-70">{load > 65 ? 'Overloaded' : load > 40 ? 'Active' : 'Clear'}</span>
          </p>
        </div>
        <div className="text-3xl">{load > 65 ? '🤯' : load > 40 ? '🤔' : '😊'}</div>
      </div>
      <div className="h-2 rounded-full overflow-hidden mt-3" style={{ background: 'rgba(253,230,138,0.15)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${load}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: load > 65 ? 'linear-gradient(90deg,#f9a8d4,#f472b6)' : 'linear-gradient(90deg,#fde68a,#fdba74)' }}
        />
      </div>
      {load > 65 && (
        <p className="text-xs mt-2" style={{ color: 'rgba(120,40,70,0.60)' }}>
          Your mind is carrying a lot. Simplifying to 2–3 core factors may unlock clarity faster.
        </p>
      )}
    </motion.div>
  );
}

export default function AnalysisDashboard({ nodes, biases, fearPct, split, reframes, rawText, onNext }) {
  const [tab, setTab] = useState('fear');
  const tabs = [
    { key: 'fear',   label: '🌸 Fear Meter' },
    { key: 'biases', label: '⚖️ Biases' },
    { key: 'split',  label: '🧠 Split View' },
    { key: 'reframe',label: '🔁 Reframe' },
    { key: 'load',   label: '📊 Load' },
  ];

  return (
    <div className="min-h-screen px-4 pt-6 pb-12 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
        <h2 className="text-3xl font-black mb-1" style={{ color: 'rgba(80,10,40,0.88)' }}>Thinking Analysis</h2>
        <p className="text-sm" style={{ color: 'rgba(160,60,90,0.55)' }}>Biases, fear patterns, and emotional balance</p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap"
            style={{
              background: tab === t.key ? 'rgba(236,72,153,0.18)' : 'rgba(244,114,182,0.07)',
              border: tab === t.key ? '1px solid rgba(236,72,153,0.40)' : '1px solid rgba(244,114,182,0.12)',
              color: tab === t.key ? 'rgba(131,24,67,0.90)' : 'rgba(160,60,90,0.50)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28 }}
        >
          {tab === 'fear'   && <FearMeter fearPct={fearPct} />}
          {tab === 'biases' && (
            <div>
              {biases.length === 0 ? (
                <div className="rounded-3xl p-8 text-center"
                  style={{ background: 'rgba(134,239,172,0.12)', border: '1px solid rgba(134,239,172,0.22)' }}>
                  <div className="text-3xl mb-2">✨</div>
                  <p className="font-bold" style={{ color: 'rgba(20,100,60,0.80)' }}>No strong biases detected</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(40,120,70,0.55)' }}>Your thinking appears relatively grounded.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs mb-3" style={{ color: 'rgba(160,60,90,0.55)' }}>
                    {biases.length} cognitive bias{biases.length !== 1 ? 'es' : ''} detected — tap each to learn more.
                  </p>
                  {biases.map((b, i) => <BiasCard key={b.key} bias={b} index={i} />)}
                </>
              )}
            </div>
          )}
          {tab === 'split'  && <SplitView split={split} />}
          {tab === 'reframe'&& <ReframeEngine reframes={reframes} />}
          {tab === 'load'   && <MentalLoadMeter nodes={nodes} />}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl text-white text-lg font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.88), rgba(168,85,247,0.85))',
          boxShadow: '0 0 40px rgba(236,72,153,0.25)',
        }}
      >
        Simulate future scenarios
        <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}
