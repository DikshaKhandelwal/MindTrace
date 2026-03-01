import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { STEPS } from '../data/coffee-menu.js';

const INK  = '#2c1a0e';
const MUTED = '#9a7a62';

export default function BrewStation({ customer, onServe, isSelf }) {
  const [step, setStep]   = useState(0);
  const [order, setOrder] = useState({});

  const current = STEPS[step];

  const handleSelect = (optionId) => {
    const newOrder = { ...order, [current.id]: optionId };
    setOrder(newOrder);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 260);
    } else {
      setTimeout(() => onServe(newOrder), 360);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg"
    >
      {/* Customer header */}
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">{customer.avatar}</div>
        <p className="text-sm italic" style={{ color: MUTED, fontFamily: 'Georgia, serif' }}>
          {isSelf ? 'What do you need today?' : `${customer.name} is waiting.`}
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-1.5 mb-6 justify-center">
        {STEPS.map((s, i) => (
          <div key={s.id} className="rounded transition-all duration-300" style={{
            width: i === step ? 28 : 8,
            height: 4,
            background: i < step ? INK : i === step ? INK : 'rgba(92,60,30,0.2)',
          }} />
        ))}
      </div>

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.28 }}
        >
          <div className="mb-4 px-5 py-4 text-center"
            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(92,60,30,0.15)' }}>
            <p className="text-[10px] uppercase tracking-widest mb-1"
              style={{ color: MUTED, fontFamily: 'monospace' }}>
              Step {step + 1} of {STEPS.length} · {current.label}
            </p>
            <p className="font-serif text-xl" style={{ color: INK }}>{current.prompt}</p>
          </div>

          <div className={`grid gap-2.5 ${current.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {current.options.map(opt => {
              const isChosen = order[current.id] === opt.id;
              return (
                <motion.button key={opt.id}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelect(opt.id)}
                  className="flex items-start gap-3 px-4 py-3.5 text-left transition-all"
                  style={{
                    background: isChosen ? 'rgba(44,26,14,0.1)' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${isChosen ? 'rgba(44,26,14,0.4)' : 'rgba(92,60,30,0.15)'}`,
                  }}
                >
                  <span className="text-xl leading-none mt-0.5 shrink-0">{opt.emoji}</span>
                  <div>
                    <p className="font-bold text-sm leading-tight mb-0.5" style={{ color: INK }}>{opt.label}</p>
                    <p className="text-xs italic" style={{ color: MUTED }}>{opt.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)}
          className="flex items-center gap-1 mt-4 text-xs hover:opacity-70 transition-opacity"
          style={{ color: MUTED, fontFamily: 'monospace' }}>
          <ChevronLeft size={12} /> Back
        </button>
      )}
    </motion.div>
  );
}
