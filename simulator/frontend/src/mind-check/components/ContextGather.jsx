import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft } from 'lucide-react';

const PLACEHOLDER = `The commute. A conversation that stayed with you. Something you kept meaning to do. How the evenings have felt. You don't need to make it interesting.`;

const PROMPTS = [
  {
    id: 'week',
    label: 'Your last week',
    question: "Write about your last week like you're updating an old friend you haven't spoken to in a while — not the highlights, just the actual texture of it.",
  },
  {
    id: 'lately',
    label: 'Lately',
    question: "What's been taking up space in your head lately? The background noise — the stuff that follows you around.",
  },
  {
    id: 'morning',
    label: 'Mornings',
    question: "Describe what your mornings have been like recently. From when the alarm goes off to getting out the door.",
  },
];

export default function ContextGather({ onContinue, onBack }) {
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState('');
  const active = PROMPTS[promptIdx];
  const canContinue = text.trim().length >= 20;

  return (
    <div className="check-bg min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="absolute top-6 left-6 flex items-center gap-2 text-black/30 hover:text-black/60 transition-colors text-sm font-mono"
      >
        <ChevronLeft size={16} /> Back
      </motion.button>

      <div className="w-full max-w-xl flex flex-col gap-8">

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-mono text-xs font-bold tracking-widest uppercase text-black/30 mb-3">
            Before we begin
          </p>
          <h2
            className="font-serif font-black leading-tight mb-0"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', color: '#1a1510', letterSpacing: '-0.02em' }}
          >
            Tell us a little<br />
            <span className="italic" style={{ color: 'rgba(26,21,16,0.55)' }}>about lately.</span>
          </h2>
        </motion.div>

        {/* Prompt switcher */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex gap-2 flex-wrap"
        >
          {PROMPTS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setPromptIdx(i); setText(''); }}
              className="px-3 py-1.5 rounded-sm font-mono text-xs font-bold tracking-wide transition-all duration-200 border"
              style={{
                background:   i === promptIdx ? '#1a1510' : 'transparent',
                color:        i === promptIdx ? '#f0ebe3' : 'rgba(0,0,0,0.35)',
                borderColor:  i === promptIdx ? '#1a1510' : 'rgba(0,0,0,0.15)',
              }}
            >
              {p.label}
            </button>
          ))}
        </motion.div>

        {/* Question */}
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-mono text-sm leading-relaxed text-black/55 mb-4">
            {active.question}
          </p>

          <textarea
            key={active.id}
            autoFocus
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            className="w-full px-5 py-4 rounded-sm font-mono text-sm leading-relaxed resize-none border focus:outline-none transition-all"
            style={{
              background:  'rgba(0,0,0,0.04)',
              borderColor: text.length > 10 ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.10)',
              color:       '#1a1510',
            }}
            maxLength={800}
          />

          <div className="flex justify-between mt-2 px-1">
            <span
              className="font-mono text-xs transition-colors"
              style={{ color: canContinue ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.18)' }}
            >
              {canContinue ? 'that\'s enough to go on' : `${Math.max(0, 20 - text.trim().length)} more words`}
            </span>
            <span className="font-mono text-xs text-black/18">{text.length}/800</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={canContinue ? { x: 5 } : {}}
          whileTap={canContinue ? { scale: 0.98 } : {}}
          onClick={() => canContinue && onContinue(text.trim(), active.id)}
          disabled={!canContinue}
          className="self-start flex items-center gap-2 font-mono font-bold text-sm transition-all duration-200"
          style={{ color: canContinue ? '#1a1510' : 'rgba(0,0,0,0.20)', cursor: canContinue ? 'pointer' : 'not-allowed' }}
        >
          Build my situations
          <motion.span
            animate={canContinue ? { x: [0, 4, 0] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight size={16} />
          </motion.span>
        </motion.button>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="font-mono text-xs text-black/20 leading-relaxed"
        >
          Not stored. Not read by any person. Used only to tailor your ten situations.
        </motion.p>
      </div>
    </div>
  );
}
