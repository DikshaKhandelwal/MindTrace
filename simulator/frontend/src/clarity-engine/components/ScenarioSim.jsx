import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function RegretSim() {
  const [choice, setChoice] = useState(null);
  const answers = {
    act: {
      label: "I acted and it went wrong.",
      message: "Even in this outcome — you gathered experience, proved courage, and eliminated one unknown. That has lasting value. The pain of a failed try fades. The question 'what if?' doesn't.",
      emoji: '💙',
    },
    notAct: {
      label: "I didn't act and stayed the same.",
      message: "Staying safe feels comfortable now — but future-you will wonder. Most people at the end of their lives regret what they didn't do, not what they tried.",
      emoji: '🌸',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 mb-5"
      style={{ background: 'rgba(255,240,248,0.70)', border: '1px solid rgba(196,181,253,0.28)', backdropFilter: 'blur(12px)' }}
    >
      <div className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: 'rgba(100,50,130,0.60)' }}>
        🔮 Regret Simulation
      </div>
      <p className="text-base font-semibold mb-5" style={{ color: 'rgba(70,10,40,0.80)' }}>
        Future-you looks back. Which version would cause more regret?
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.entries(answers).map(([k, v]) => (
          <motion.button
            key={k}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setChoice(k)}
            className="rounded-2xl p-4 text-sm font-medium text-left transition-all"
            style={{
              background: choice === k ? 'rgba(168,85,247,0.18)' : 'rgba(196,181,253,0.10)',
              border: choice === k ? '1.5px solid rgba(168,85,247,0.50)' : '1px solid rgba(196,181,253,0.22)',
              color: 'rgba(70,10,60,0.80)',
            }}
          >
            {v.emoji} {v.label}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {choice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-4 text-sm leading-relaxed"
            style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.22)', color: 'rgba(70,10,60,0.78)' }}
          >
            {answers[choice].message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ScenarioSim({ scenarios, fearPct, onNext }) {
  const [revealed, setRevealed] = useState({ best: false, realistic: false, worst: false });

  function revealAll() {
    setRevealed({ best: true, realistic: true, worst: true });
  }

  const allRevealed = Object.values(revealed).every(Boolean);
  const order = ['best', 'realistic', 'worst'];

  return (
    <div className="min-h-screen px-4 pt-6 pb-12 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h2 className="text-3xl font-black mb-1" style={{ color: 'rgba(80,10,40,0.88)' }}>
          Future Paths
        </h2>
        <p className="text-sm mb-1" style={{ color: 'rgba(160,60,90,0.55)' }}>
          Three realistic outcomes based on your thinking patterns.
        </p>
        {fearPct > 55 && (
          <div className="inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.28)', color: 'rgba(131,24,67,0.75)' }}>
            ⚠️ Your fear estimate may inflate the worst-case probability
          </div>
        )}
      </motion.div>

      {/* Scenario cards */}
      <div className="space-y-3 mb-5">
        {order.map((key, i) => {
          const s = scenarios[key];
          const isRevealed = revealed[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="rounded-3xl overflow-hidden cursor-pointer"
              style={{
                background: isRevealed ? `${s.color}14` : 'rgba(255,240,248,0.55)',
                border: `1px solid ${isRevealed ? s.color + '44' : 'rgba(244,114,182,0.15)'}`,
                backdropFilter: 'blur(12px)',
              }}
              onClick={() => setRevealed(r => ({ ...r, [key]: true }))}
            >
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-black text-base" style={{ color: isRevealed ? s.color : 'rgba(160,60,90,0.55)' }}>
                        {s.title}
                      </div>
                      <div className="text-xs font-medium mt-0.5" style={{ color: 'rgba(140,60,90,0.50)' }}>
                        Probability: {s.probability}%
                      </div>
                    </div>
                  </div>
                  {/* Prob bar */}
                  <div className="text-right">
                    <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(244,114,182,0.10)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isRevealed ? `${s.probability}%` : 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: s.color }}
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isRevealed ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm leading-relaxed"
                      style={{ color: 'rgba(80,20,50,0.72)' }}
                    >
                      {s.description}
                    </motion.p>
                  ) : (
                    <p className="text-sm italic" style={{ color: 'rgba(180,100,130,0.40)' }}>
                      Tap to reveal this scenario →
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Probability totals bar */}
      {allRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 mb-5"
          style={{ background: 'rgba(255,240,248,0.65)', border: '1px solid rgba(244,114,182,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: 'rgba(120,40,70,0.55)' }}>Probability Weight</p>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {order.map(key => {
              const s = scenarios[key];
              return (
                <motion.div
                  key={key}
                  initial={{ flex: 0 }}
                  animate={{ flex: s.probability }}
                  transition={{ duration: 0.9 }}
                  className="rounded-full"
                  style={{ background: s.color }}
                  title={`${s.title}: ${s.probability}%`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: 'rgba(140,60,90,0.50)' }}>
            <span>🌱 Best {scenarios.best.probability}%</span>
            <span>🌤️ Likely {scenarios.realistic.probability}%</span>
            <span>⛈️ Worst {scenarios.worst.probability}%</span>
          </div>
          <p className="text-xs text-center mt-3 font-medium" style={{ color: 'rgba(120,40,70,0.60)' }}>
            The worst case takes up {scenarios.worst.probability}% of probability space — likely less than your fear suggests.
          </p>
        </motion.div>
      )}

      {!allRevealed && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={revealAll}
          className="w-full py-3 rounded-2xl text-sm font-bold mb-4 transition-all"
          style={{ background: 'rgba(244,114,182,0.10)', border: '1px solid rgba(244,114,182,0.25)', color: 'rgba(131,24,67,0.70)' }}
        >
          Reveal all scenarios
        </motion.button>
      )}

      {/* Regret Simulation */}
      <RegretSim />

      {/* Continue */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white text-lg font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.88), rgba(168,85,247,0.85))',
          boxShadow: '0 0 40px rgba(236,72,153,0.25)',
        }}
      >
        Generate my clarity report
        <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}
