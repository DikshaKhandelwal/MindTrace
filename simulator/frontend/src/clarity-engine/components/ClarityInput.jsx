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
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 max-w-xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold tracking-widest uppercase"
          style={{ background: 'rgba(244,114,182,0.14)', color: 'rgba(131,24,67,0.80)', border: '1px solid rgba(244,114,182,0.28)' }}>
          <Sparkles size={11} />
          Cognitive Debugger
        </div>

        <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4"
          style={{ color: 'rgba(80,10,40,0.90)' }}>
          What's tangled<br />
          <span style={{
            background: 'linear-gradient(135deg, #f472b6, #a855f7, #fb923c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>in your mind?</span>
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(120,40,70,0.60)' }}>
          Type any decision, spiral, or fear below.
          The system maps your thinking, finds the loops, and guides you to clarity.
        </p>
      </motion.div>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55 }}
        className="w-full max-w-2xl"
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
              rows={6}
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
              <span className="text-xs" style={{ color: 'rgba(160,80,110,0.45)' }}>
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

        {/* Example prompts */}
        <div className="mt-5">
          <p className="text-xs text-center mb-3" style={{ color: 'rgba(160,80,110,0.45)' }}>
            Or try an example →
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => usePrompt(p)}
                className="px-4 py-2 rounded-2xl text-xs font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(244,114,182,0.10)',
                  border: '1px solid rgba(244,114,182,0.22)',
                  color: 'rgba(131,24,67,0.65)',
                }}
              >
                "{p.slice(0, 38)}…"
              </button>
            ))}
          </div>
        </div>

        {/* Node legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {NODE_LEGEND.map(n => (
            <div key={n.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(120,40,70,0.55)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: n.color }} />
              {n.label}
            </div>
          ))}
          <span className="text-xs" style={{ color: 'rgba(160,80,110,0.35)' }}>— nodes your map will build</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
