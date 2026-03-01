import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TYPE_CFG } from '../data/gptEngine';

// ── Helpers ───────────────────────────────────────────────────────────────────
function clarityScore(nodes) {
  const pos = nodes.filter(n => ['goal', 'opportunity', 'outcome'].includes(n.type)).length;
  const neg = nodes.filter(n => ['fear', 'pressure', 'unknown', 'past'].includes(n.type)).length;
  const total = pos + neg;
  if (total === 0) return 0;
  return Math.round((pos / total) * 100);
}

function scoreLabel(s) {
  if (s >= 70) return { text: 'High Clarity',      color: '#34d399', bg: 'rgba(52,211,153,0.1)'  };
  if (s >= 40) return { text: 'Emerging Clarity',  color: '#f472b6', bg: 'rgba(244,114,182,0.1)' };
  return             { text: 'Still Tangled',      color: '#f87171', bg: 'rgba(248,113,113,0.1)' };
}

function Section({ title, sub, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(244,114,182,0.5)' }}>
          {title}
        </p>
      </div>
      {sub && (
        <p className="text-xs italic mb-2" style={{ color: 'rgba(131,24,67,0.40)' }}>
          &ldquo;{sub}&rdquo;
        </p>
      )}
      {children}
    </div>
  );
}

function AnswerCard({ label, value, color = '#f472b6', bg = 'rgba(244,114,182,0.06)' }) {
  return (
    <div className="rounded-2xl px-4 py-3 mb-2.5" style={{ background: bg, border: `1px solid ${color}33` }}>
      {label && <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color }}>{label}</p>}
      <p className="text-sm font-semibold leading-snug" style={{ color: '#1e0a14' }}>{value}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ClarityReport({ nodes, rawText, answers, onClose, onReset }) {
  const score = useMemo(() => clarityScore(nodes), [nodes]);
  const { text: scoreTxt, color: scoreColor, bg: scoreBg } = scoreLabel(score);

  const decisionNode = nodes.find(n => n.type === 'decision');
  const fearNodes    = nodes.filter(n => n.type === 'fear');
  const goalNodes    = nodes.filter(n => n.type === 'goal');
  const oppNodes     = nodes.filter(n => n.type === 'opportunity');
  const hasAnswers   = answers && Object.keys(answers).length > 0;

  const breakdown = Object.entries(TYPE_CFG)
    .map(([type, cfg]) => ({ type, cfg, count: nodes.filter(n => n.type === type).length }))
    .filter(x => x.count > 0 && x.type !== 'decision');

  const momentumMsg = score >= 70
    ? "You have enough clarity to act. Action generates more clarity than thinking ever will."
    : score >= 40
    ? "You're closer than you feel. One small decision will reveal the next step."
    : "The thinking has done its job. Now it's time to let go and choose.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto"
      style={{ background: 'rgba(20,5,12,0.82)', backdropFilter: 'blur(14px)' }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-lg rounded-3xl mb-8 overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 32px 96px rgba(244,114,182,0.3)' }}
      >
        {/* ── Hero ────────────────────────────────────────────────── */}
        <div className="px-6 py-7 text-center"
          style={{ background: 'linear-gradient(135deg,#fff1f5,#fce7f3)' }}>
          <div className="text-4xl mb-2">🧠</div>
          <h2 className="text-xl font-black mb-1" style={{ color: '#831843' }}>Clarity Report</h2>
          <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(244,114,182,0.10)', border: '1px solid rgba(244,114,182,0.22)', color: 'rgba(131,24,67,0.70)' }}>
              <span className="font-black" style={{ background: 'rgba(80,10,40,0.82)', color: '#fff', borderRadius: 4, padding: '0 4px', fontSize: 9 }}>{nodes.length}</span>
              nodes
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(134,239,172,0.10)', border: '1px solid rgba(134,239,172,0.30)', color: '#065f46' }}>
              <span className="font-black" style={{ background: 'rgba(6,95,70,0.82)', color: '#fff', borderRadius: 4, padding: '0 4px', fontSize: 9 }}>{goalNodes.length + oppNodes.length}</span>
              positive
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.28)', color: '#7f1d1d' }}>
              <span className="font-black" style={{ background: 'rgba(127,29,29,0.82)', color: '#fff', borderRadius: 4, padding: '0 4px', fontSize: 9 }}>{fearNodes.length}</span>
              fear{fearNodes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Score ring */}
          <div className="flex justify-center mb-3">
            <div className="relative flex items-center justify-center" style={{ width: 108, height: 108 }}>
              <svg width="108" height="108" className="absolute inset-0">
                <circle cx="54" cy="54" r="44" fill="none" stroke="rgba(244,114,182,0.1)" strokeWidth="8" />
                <motion.circle cx="54" cy="54" r="44" fill="none" stroke={scoreColor} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  initial={{ strokeDashoffset: `${2 * Math.PI * 44}` }}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 44 * (1 - score / 100)}` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black tabular-nums" style={{ color: '#1e0a14' }}>{score}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(244,114,182,0.55)' }}>/100</span>
              </div>
            </div>
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide"
            style={{ background: scoreBg, color: scoreColor, border: `1px solid ${scoreColor}44` }}>
            {scoreTxt}
          </span>
        </div>

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="px-6 py-6">

          {/* Decision */}
          {decisionNode && (
            <Section title="The decision">
              <div className="rounded-2xl px-4 py-3.5"
                style={{ background: 'rgba(244,114,182,0.06)', border: '1.5px solid rgba(244,114,182,0.22)' }}>
                <p className="text-sm font-bold" style={{ color: '#831843' }}>{decisionNode.data.label}</p>
              </div>
            </Section>
          )}

          {/* Node breakdown — editorial numbered list */}
          <Section title="What your mind mapped" sub="Every node your thinking created">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1.5px solid rgba(244,114,182,0.20)', background: 'rgba(255,245,250,0.60)' }}
            >
              {breakdown.map(({ type, cfg, count }, i) => (
                <div
                  key={type}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderBottom: i < breakdown.length - 1 ? '1px solid rgba(244,114,182,0.10)' : 'none' }}
                >
                  <span
                    className="text-[10px] font-black tabular-nums w-5 shrink-0 text-right"
                    style={{ color: 'rgba(244,114,182,0.40)' }}
                  >
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <span className="text-sm shrink-0">{cfg.emoji}</span>
                  <span className="flex-1 text-xs font-semibold" style={{ color: cfg.color }}>
                    {cfg.title}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-black shrink-0"
                    style={{ background: 'rgba(80,10,40,0.80)', color: '#fff' }}
                  >
                    {count}
                  </span>
                  <span className="text-xs font-bold shrink-0" style={{ color: 'rgba(244,114,182,0.40)' }}>→</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Intervention answers */}
          {hasAnswers && (
            <>
              {answers.insight && (
                <Section title="What you already knew">
                  <AnswerCard value={answers.insight.text} color="#34d399" bg="rgba(52,211,153,0.07)" />
                </Section>
              )}

              {(answers.want || answers.choose || answers.worst) && (
                <Section title="Your core answers">
                  {answers.want   && <AnswerCard label="What you want"    value={answers.want.text}   color="#f472b6" />}
                  {answers.choose && <AnswerCard label="Your choice"      value={answers.choose.text} color="#a78bfa" bg="rgba(167,139,250,0.08)" />}
                  {answers.worst  && <AnswerCard label="Realistic worst"  value={answers.worst.text}  color="#f87171" bg="rgba(248,113,113,0.07)" />}
                </Section>
              )}

              {[answers.positive_0, answers.positive_1, answers.positive_2].some(Boolean) && (
                <Section title="Things that could go right">
                  {[answers.positive_0, answers.positive_1, answers.positive_2].filter(Boolean).map((p, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl text-sm mb-1.5"
                      style={{ background: 'rgba(134,239,172,0.12)', border: '1px solid rgba(134,239,172,0.3)', color: '#14532d' }}>
                      <span className="font-bold shrink-0 mt-0.5 text-green-500">✓</span>
                      <span>{p.text}</span>
                    </div>
                  ))}
                </Section>
              )}

              {answers.commit && (
                <Section title="Your commitment">
                  <div className="rounded-2xl p-4 text-center"
                    style={{ background: 'linear-gradient(135deg,rgba(244,114,182,0.08),rgba(167,139,250,0.08))',
                      border: '1.5px solid rgba(244,114,182,0.25)' }}>
                    <p className="text-sm font-black" style={{ color: '#831843' }}>"{answers.commit.text}"</p>
                  </div>
                </Section>
              )}
            </>
          )}

          {/* Momentum */}
          <div className="rounded-2xl px-4 py-4 mb-5 text-center"
            style={{ background: 'linear-gradient(135deg,rgba(244,114,182,0.06),rgba(167,139,250,0.06))', border: '1px solid rgba(244,114,182,0.15)' }}>
            <p className="text-sm font-bold leading-snug" style={{ color: '#831843' }}>{momentumMsg}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
              style={{ background: 'rgba(244,114,182,0.08)', color: '#be185d', border: '1.5px solid rgba(244,114,182,0.2)' }}>
              Back to map
            </button>
            <button onClick={onReset}
              className="flex-1 py-3 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg,#f9a8d4,#f472b6)', boxShadow: '0 4px 20px rgba(244,114,182,0.3)' }}>
              Start fresh →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

