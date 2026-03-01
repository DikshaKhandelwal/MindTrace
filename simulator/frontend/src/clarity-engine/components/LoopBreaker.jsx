import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_COLORS = {
  amplification: {
    accent: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700 border-rose-300',
    button: 'from-rose-500 to-pink-500',
    chain: 'bg-rose-100 text-rose-700',
    chainArrow: 'text-rose-400',
    loop: 'bg-rose-500 text-white',
    assumption: 'bg-rose-50 border-rose-300',
  },
  uncertainty: {
    accent: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    button: 'from-indigo-500 to-violet-500',
    chain: 'bg-indigo-100 text-indigo-700',
    chainArrow: 'text-indigo-400',
    loop: 'bg-indigo-500 text-white',
    assumption: 'bg-indigo-50 border-indigo-300',
  },
  social: {
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    button: 'from-amber-500 to-orange-500',
    chain: 'bg-amber-100 text-amber-700',
    chainArrow: 'text-amber-400',
    loop: 'bg-amber-500 text-white',
    assumption: 'bg-amber-50 border-amber-300',
  },
  selfDoubt: {
    accent: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    badge: 'bg-slate-200 text-slate-700 border-slate-300',
    button: 'from-slate-500 to-gray-500',
    chain: 'bg-slate-200 text-slate-700',
    chainArrow: 'text-slate-400',
    loop: 'bg-slate-500 text-white',
    assumption: 'bg-slate-50 border-slate-300',
  },
};

export default function LoopBreaker({ loopInfo, onBreak }) {
  const [checked, setChecked] = useState([false, false, false, false]);
  const [expanded, setExpanded] = useState(null);
  const [broken, setBroken] = useState(false);

  if (!loopInfo?.detected) return null;

  const colors = TYPE_COLORS[loopInfo.type] || TYPE_COLORS.amplification;
  const allChecked = checked.every(Boolean);

  function toggle(i) {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  function handleBreak() {
    setBroken(true);
    setTimeout(() => onBreak?.(), 800);
  }

  if (broken) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl bg-emerald-50 border border-emerald-300 p-6 text-center shadow-sm"
      >
        <div className="text-3xl mb-2">✅</div>
        <p className="font-bold text-emerald-700 text-lg">Loop interrupted</p>
        <p className="text-emerald-600 text-sm mt-1">
          You've identified the pattern and its root. The graph will now show your thinking more clearly.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border ${colors.border} bg-white shadow-sm overflow-hidden`}
    >
      {/* Header */}
      <div className={`${colors.bg} px-5 py-4 border-b ${colors.border}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${colors.badge}`}>
            Overthinking Loop Detected
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl">{loopInfo.emoji}</span>
          <h3 className={`font-bold text-lg ${colors.accent}`}>{loopInfo.label}</h3>
        </div>
        <p className="text-slate-500 text-sm mt-1 italic">&ldquo;{loopInfo.tagline}&rdquo;</p>
      </div>

      <div className="px-5 py-4 space-y-5">

        {/* Causal Chain */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">How it feeds itself</p>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-1">
            {loopInfo.chain.map((node, i) => {
              const isLoop = node === '🔁' || node.startsWith('🔁');
              const isArrow = node === '→';
              if (isArrow) {
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={`text-lg font-bold ${colors.chainArrow}`}
                  >
                    →
                  </motion.span>
                );
              }
              if (isLoop) {
                return (
                  <motion.span
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.loop} whitespace-nowrap`}
                  >
                    {node}
                  </motion.span>
                );
              }
              return (
                <motion.span
                  key={i}
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.chain} whitespace-nowrap max-w-[140px] truncate`}
                  title={node}
                >
                  {node}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Root Assumption */}
        <div className={`rounded-xl border ${colors.assumption} p-4`}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Root belief powering this loop</p>
          <p className={`font-semibold text-sm ${colors.accent} leading-relaxed`}>
            "{loopInfo.rootAssumption}"
          </p>
        </div>

        {/* Break Steps */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Complete all 4 steps to break the loop
          </p>
          <div className="space-y-2">
            {loopInfo.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className={`rounded-xl border transition-all ${
                  checked[i]
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">{step.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${checked[i] ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                      Step {i + 1}: {step.title}
                    </p>
                  </div>
                  <span className="text-slate-300 text-xs mt-0.5 flex-shrink-0">
                    {expanded === i ? '▲' : '▼'}
                  </span>
                </button>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pl-12">
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{step.action}</p>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checked[i]}
                            onChange={() => toggle(i)}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-slate-600">I've done this</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Break button */}
        <motion.button
          disabled={!allChecked}
          onClick={handleBreak}
          whileHover={allChecked ? { scale: 1.02 } : {}}
          whileTap={allChecked ? { scale: 0.98 } : {}}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
            allChecked
              ? `bg-gradient-to-r ${colors.button} text-white shadow-md`
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {allChecked ? '🔓 Break the Loop' : `Complete ${checked.filter(Boolean).length} / 4 steps to unlock`}
        </motion.button>

      </div>
    </motion.div>
  );
}
