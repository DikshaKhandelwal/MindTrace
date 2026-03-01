import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, ChevronDown, ChevronUp, Star, Zap, TrendingUp, ChevronLeft } from 'lucide-react';

// Animated circular score ring
function ScoreRing({ score, color, size = 100 }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth="7" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

const scoreColors = {
  assertiveness: '#8b5cf6',
  empathy:       '#14b8a6',
  clarity:       '#f97316',
};

const scoreEmojis = {
  assertiveness: '💪',
  empathy:       '💚',
  clarity:       '🎯',
};

const momentTypeConfig = {
  strength: { bg: 'bg-mint-50',   border: 'border-mint-200',   dot: 'bg-mint-400',  text: 'text-mint-700' },
  weakness: { bg: 'bg-peach-50',  border: 'border-peach-200',  dot: 'bg-peach-400', text: 'text-peach-700' },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function FeedbackReport({ feedback, scenarioData, history, onReplay, onNewScenario, onBack }) {
  const { scores, overallSummary, keyMoments, betterResponses, growthAreas, strengths, nextChallenge } = feedback;
  const [openBetter, setOpenBetter] = useState(null);

  const avgScore = Math.round(
    (scores.assertiveness.score + scores.empathy.score + scores.clarity.score) / 3
  );

  const overallGrade =
    avgScore >= 80 ? { label: 'Excellent', emoji: '🌟', color: 'text-mint-600' } :
    avgScore >= 60 ? { label: 'Good',      emoji: '✅', color: 'text-lavender-600' } :
    avgScore >= 40 ? { label: 'Developing',emoji: '🌱', color: 'text-peach-600' } :
                     { label: 'Needs Work', emoji: '💪', color: 'text-pink-600' };

  return (
    <div className="min-h-screen px-4 py-12 overflow-y-auto">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-lavender-300/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-mint-300/15 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Back to Hub */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
          >
            <ChevronLeft size={15} /> Back to Hub
          </button>
        )}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center pt-4 pb-2">
            <motion.div
              className="text-6xl mb-3 inline-block"
              animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.9, delay: 0.4 }}
            >
              {overallGrade.emoji}
            </motion.div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-lavender-100 rounded-full text-lavender-700 text-sm font-medium mb-3">
              Session Complete · {scenarioData.scenario.title}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">Your Coaching Report</h2>
            <p className={`text-lg font-semibold ${overallGrade.color}`}>{overallGrade.label}</p>
          </motion.div>

          {/* Score cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
            {['assertiveness', 'empathy', 'clarity'].map((key) => {
              const s = scores[key];
              const color = scoreColors[key];
              return (
                <div key={key} className="glass-card-strong p-5 text-center">
                  <div className="relative inline-flex items-center justify-center mb-3">
                    <ScoreRing score={s.score} color={color} size={90} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold" style={{ color }}>{s.score}</span>
                      <span className="text-xs text-gray-400">/100</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-0.5 flex items-center justify-center gap-1.5">
                    {scoreEmojis[key]} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">{s.label}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Overall summary */}
          <motion.div variants={itemVariants} className="glass-card-strong p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Overall</p>
            <p className="text-gray-700 leading-relaxed">{overallSummary}</p>
            {nextChallenge && (
              <div className="mt-4 flex items-start gap-2.5 bg-lavender-50 rounded-2xl px-4 py-3">
                <Zap size={14} className="text-lavender-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-lavender-700"><span className="font-semibold">Next challenge: </span>{nextChallenge}</p>
              </div>
            )}
          </motion.div>

          {/* Score breakdowns */}
          <motion.div variants={itemVariants} className="glass-card p-6 space-y-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Detailed Feedback</p>
            {['assertiveness', 'empathy', 'clarity'].map((key) => {
              const s = scores[key];
              const color = scoreColors[key];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      {scoreEmojis[key]} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className="text-sm font-bold" style={{ color }}>{s.score}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.feedback}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Strengths */}
          {strengths && strengths.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star size={15} className="text-yellow-500" />
                <p className="text-sm font-semibold text-gray-700">What you did well</p>
              </div>
              <ul className="space-y-2.5">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-mint-100 text-mint-600 flex items-center justify-center text-xs font-bold">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Growth areas */}
          {growthAreas && growthAreas.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-peach-500" />
                <p className="text-sm font-semibold text-gray-700">Areas to grow</p>
              </div>
              <ul className="space-y-2.5">
                {growthAreas.map((g, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-peach-100 text-peach-600 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Key moments */}
          {keyMoments && keyMoments.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Key Moments</p>
              <div className="space-y-2.5">
                {keyMoments.map((m, i) => {
                  const cfg = momentTypeConfig[m.type] || momentTypeConfig.strength;
                  return (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${cfg.dot}`} />
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>
                          Turn {m.turn} · {m.type === 'strength' ? 'Strength' : 'Opportunity'}
                        </span>
                        <p className="text-sm text-gray-600 mt-0.5">{m.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Better responses */}
          {betterResponses && betterResponses.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Better Response Suggestions
              </p>
              <div className="space-y-3">
                {betterResponses.map((b, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenBetter(openBetter === i ? null : i)}
                      className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-400 mb-1">Your message</p>
                        <p className="text-sm text-gray-600 line-clamp-2 italic">"{b.original}"</p>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {openBetter === i
                          ? <ChevronUp size={14} className="text-gray-400" />
                          : <ChevronDown size={14} className="text-gray-400" />
                        }
                      </div>
                    </button>
                    <AnimatePresence>
                      {openBetter === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-100">
                            <div className="bg-lavender-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-lavender-600 mb-1.5">✨ Suggested improvement</p>
                              <p className="text-sm text-lavender-800">"{b.improved}"</p>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              <span className="font-medium text-gray-600">Why: </span>{b.why}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
            <button
              onClick={onReplay}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-lavender-700 text-base
                bg-lavender-50 border border-lavender-200 hover:bg-lavender-100 active:scale-98 transition-all duration-200"
            >
              <RotateCcw size={17} />
              Replay This Scenario
            </button>
            <button
              onClick={onNewScenario}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-lavender-500 to-purple-600 shadow-glow
                hover:shadow-[0_0_40px_rgba(139,92,246,0.35)] hover:scale-[1.02]
                active:scale-100 transition-all duration-300"
            >
              <Sparkles size={17} />
              New Scenario
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
