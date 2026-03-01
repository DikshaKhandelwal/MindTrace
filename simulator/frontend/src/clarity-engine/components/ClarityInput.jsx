import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const PROMPTS = [
  "Should I switch jobs? I'm scared I'll regret it...",
  "I want to end this relationship but everyone will judge me...",
  "I'm afraid to start my business because I might fail...",
  "Should I move to a new city? I don't know anyone there...",
  "I want to speak up but I'm scared of what they'll think...",
];

const NODE_LEGEND = [
  { color: '#fda4af', label: 'Fear' },
  { color: '#93c5fd', label: 'Logic' },
  { color: '#86efac', label: 'Opportunity' },
  { color: '#fde68a', label: 'Unknown' },
  { color: '#c4b5fd', label: 'Pressure' },
  { color: '#fdba74', label: 'Past' },
];

export default function ClarityInput({ onAnalyse }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const canAnalyse = wordCount >= 4;

  function usePrompt(p) {
    setText(p);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 max-w-3xl w-full"
      >
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase"
            style={{ background: 'rgba(244,114,182,0.14)', color: 'rgba(131,24,67,0.80)', border: '1px solid rgba(244,114,182,0.28)' }}>
            <Sparkles size={11} />
            Cognitive Debugger
          </div>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-black"
            style={{ background: 'rgba(80,10,40,0.82)', color: '#fff' }}
          >
            04
          </span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-black leading-tight mb-5"
          style={{ color: 'rgba(80,10,40,0.90)' }}>
          What's tangled<br />
          <span style={{
            background: 'linear-gradient(135deg, #f472b6, #a855f7, #fb923c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>in your mind?</span>
        </h1>
        <p className="text-xl leading-relaxed" style={{ color: 'rgba(120,40,70,0.60)' }}>
          Type any decision, spiral, or fear below.
          The system maps your thinking, finds the loops, and guides you to clarity.
        </p>
        <p className="text-base mt-3 italic" style={{ color: 'rgba(160,80,110,0.45)' }}>
          &ldquo;Map it, break it, clear it.&rdquo;
        </p>
      </motion.div>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55 }}
        className="w-full max-w-3xl"
      >
        <div
          className="rounded-3xl p-1.5 transition-all duration-300"
          style={{
            background: focused
              ? 'linear-gradient(135deg, rgba(244,114,182,0.5), rgba(168,85,247,0.4), rgba(251,146,60,0.4))'
              : 'rgba(255,220,235,0.40)',
            boxShadow: focused
              ? '0 0 60px rgba(244,114,182,0.25), 0 8px 40px rgba(0,0,0,0.08)'
              : '0 4px 24px rgba(200,100,150,0.12)',
          }}
        >
          <div className="rounded-[20px] overflow-hidden"
            style={{ background: 'rgba(255,245,250,0.82)', backdropFilter: 'blur(20px)' }}>
            <textarea
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Share what's weighing on your mind... the more honest, the clearer your map."
              className="w-full px-6 pt-6 pb-3 text-lg leading-relaxed resize-none focus:outline-none"
              style={{
                background: 'transparent',
                color: 'rgba(70,10,40,0.85)',
                caretColor: '#f472b6',
              }}
              maxLength={800}
            />
            <div className="flex items-center justify-between px-6 pb-5 pt-2">
              <span className="text-sm" style={{ color: 'rgba(160,80,110,0.45)' }}>
                {wordCount} word{wordCount !== 1 ? 's' : ''} · {800 - text.length} chars left
              </span>
              <motion.button
                whileHover={canAnalyse ? { scale: 1.04 } : {}}
                whileTap={canAnalyse ? { scale: 0.97 } : {}}
                onClick={() => canAnalyse && onAnalyse(text)}
                disabled={!canAnalyse}
                className="flex items-center gap-2.5 px-7 py-3 rounded-2xl text-white font-bold text-base transition-all"
                style={{
                  background: canAnalyse
                    ? 'linear-gradient(135deg, rgba(236,72,153,0.90), rgba(168,85,247,0.85))'
                    : 'rgba(200,150,180,0.25)',
                  boxShadow: canAnalyse ? '0 0 32px rgba(236,72,153,0.30)' : 'none',
                  color: canAnalyse ? '#fff' : 'rgba(180,120,150,0.55)',
                }}
              >
                Map my thinking
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Example prompts — editorial numbered list */}
        <div className="mt-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(131,24,67,0.45)' }}>
              Or try an example
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-black"
              style={{ background: 'rgba(80,10,40,0.82)', color: '#fff' }}
            >
              {PROMPTS.length}
            </span>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1.5px solid rgba(244,114,182,0.22)', background: 'rgba(255,245,250,0.72)' }}
          >
            {PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => usePrompt(p)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-pink-50 group"
                style={{ borderBottom: i < PROMPTS.length - 1 ? '1px solid rgba(244,114,182,0.12)' : 'none' }}
              >
                <span
                  className="text-[10px] font-black tabular-nums shrink-0 w-5 text-right"
                  style={{ color: 'rgba(244,114,182,0.45)' }}
                >
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <span className="flex-1 text-sm leading-snug italic" style={{ color: 'rgba(120,40,70,0.70)' }}>
                  &ldquo;{p}&rdquo;
                </span>
                <span
                  className="shrink-0 text-xs font-bold group-hover:translate-x-0.5 transition-transform"
                  style={{ color: 'rgba(244,114,182,0.45)' }}
                >
                  →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Node legend — editorial badge row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-7"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(131,24,67,0.40)' }}>
              Node types your map builds
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-black"
              style={{ background: 'rgba(80,10,40,0.80)', color: '#fff' }}
            >
              {NODE_LEGEND.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {NODE_LEGEND.map(n => (
              <div
                key={n.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                style={{
                  background: n.color + '22',
                  border: `1.5px solid ${n.color}66`,
                  color: 'rgba(80,10,40,0.78)',
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: n.color }} />
                {n.label}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
