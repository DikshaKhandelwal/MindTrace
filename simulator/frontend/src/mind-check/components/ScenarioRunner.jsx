import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
const slide = {
  initial: (d) => ({ opacity: 0, x: d > 0 ? 80 : -80, filter: 'blur(4px)' }),
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit:    (d) => ({ opacity: 0, x: d > 0 ? -80 : 80, filter: 'blur(4px)' }),
};
const t = { duration: 0.38, ease: [0.4, 0, 0.2, 1] };

export default function ScenarioRunner({ scenarios, onComplete }) {
  const [index,   setIndex]   = useState(0);
  const [dir,     setDir]     = useState(1);
  const [picks,   setPicks]   = useState([]);
  const [chosen,  setChosen]  = useState(null); // chosen choice for current card (before confirm)

  const scenario = scenarios[index];
  const total    = scenarios.length;

  const selectChoice = (ci) => {
    setChosen(ci);
  };

  const advance = () => {
    if (chosen === null) return;
    const newPicks = [...picks];
    newPicks[index] = chosen;
    setPicks(newPicks);

    if (index < total - 1) {
      setDir(1);
      setIndex(index + 1);
      setChosen(newPicks[index + 1] ?? null);
    } else {
      onComplete(newPicks);
    }
  };

  const goBack = () => {
    if (index === 0) return;
    setDir(-1);
    setIndex(index - 1);
    setChosen(picks[index - 1] ?? null);
  };

  const progressPct = (index / total) * 100;

  return (
    <div className="check-bg min-h-screen flex flex-col">

      {/* Progress bar — thin at top */}
      <div className="w-full h-0.5 bg-black/08">
        <motion.div
          className="h-full bg-black/30"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between px-6 pt-5 pb-0">
        <button
          onClick={goBack}
          disabled={index === 0}
          className="flex items-center gap-1.5 font-mono text-xs text-black/30 hover:text-black/55 disabled:opacity-0 transition-colors disabled:pointer-events-none"
        >
          <ArrowLeft size={13} /> back
        </button>
        <p className="font-mono text-xs text-black/30 tracking-widest">
          {index + 1} <span className="text-black/20">/ {total}</span>
        </p>
      </div>

      {/* Scenario area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8" style={{ minHeight: 0 }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={slide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={t}
            className="w-full max-w-xl flex flex-col items-start gap-8"
          >
            {/* Title */}
            <div>
              <h2
                className="font-serif font-black leading-tight mb-3"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', color: '#1a1510', letterSpacing: '-0.02em' }}
              >
                {scenario.title}
              </h2>
              {/* Situation desc */}
              <p className="font-mono text-sm leading-relaxed text-black/55 max-w-sm">
                {scenario.situation}
              </p>
            </div>

            {/* Choices */}
            <div className="flex flex-col gap-3 w-full">
              {scenario.choices.map((choice, ci) => {
                const isSelected = chosen === ci;
                return (
                  <motion.button
                    key={ci}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectChoice(ci)}
                    className="group w-full text-left px-5 py-4 rounded-sm border transition-all duration-200 relative"
                    style={{
                      background: isSelected ? '#c8bb9e' : 'rgba(0,0,0,0.04)',
                      borderColor: isSelected ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.10)',
                      borderWidth: isSelected ? '1.5px' : '1px',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Choice marker */}
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-sm border mt-0.5 flex items-center justify-center transition-all"
                        style={{
                          borderColor: isSelected ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.18)',
                          background: isSelected ? '#1a1510' : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            width="10" height="8" viewBox="0 0 10 8" fill="none"
                          >
                            <path d="M1 4L3.5 6.5L9 1" stroke="#f0ebe3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </div>
                      <p
                        className="font-mono text-sm leading-relaxed"
                        style={{ color: isSelected ? '#1a1510' : 'rgba(0,0,0,0.55)' }}
                      >
                        {choice.text}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Next button */}
            <motion.button
              whileHover={chosen !== null ? { x: 6 } : {}}
              whileTap={chosen !== null ? { scale: 0.98 } : {}}
              onClick={advance}
              disabled={chosen === null}
              className="flex items-center gap-2 font-mono font-bold text-sm transition-all duration-200"
              style={{ color: chosen !== null ? '#1a1510' : 'rgba(0,0,0,0.2)', cursor: chosen !== null ? 'pointer' : 'not-allowed' }}
            >
              {index < total - 1 ? 'Next' : 'See result'}
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
