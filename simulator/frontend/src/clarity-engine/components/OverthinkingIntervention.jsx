import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Overthinking pattern profiles ─────────────────────────────────────────────
const PATTERNS = {
  fear_spiral: {
    name: 'Fear Spiral',
    emoji: '🌀',
    color: '#f43f5e',
    desc: 'Your brain keeps generating "what if" fears, each one feeding the next. You\'re not thinking — you\'re looping.',
    bias: 'Catastrophising + Fortune Telling',
  },
  analysis_paralysis: {
    name: 'Analysis Paralysis',
    emoji: '🧊',
    color: '#6366f1',
    desc: 'More information feels like progress, but it isn\'t. You\'re using exploration to avoid the discomfort of choosing.',
    bias: 'Perfectionistic Thinking',
  },
  rumination: {
    name: 'Rumination Loop',
    emoji: '🔁',
    color: '#f59e0b',
    desc: 'You keep returning to the same thought from different angles. It\'s not analysis — it\'s anxiety disguised as thinking.',
    bias: 'Mental Filter + Magnification',
  },
};

// ── Mirror reflection ─────────────────────────────────────────────────────────
const MIRROR_TRUTHS = [
  {
    icon: '🪞',
    truth: 'You already know what you want to do.',
    sub: 'The thinking isn\'t confusion. It\'s resistance. There\'s a difference.',
  },
  {
    icon: '⏳',
    truth: 'Every cycle of overthinking costs you something real.',
    sub: 'Energy. Time. The version of you that could already be living the answer.',
  },
  {
    icon: '🧠',
    truth: 'Your brain invented the danger. The map isn\'t the territory.',
    sub: 'Fear nodes aren\'t facts. They\'re your mind pattern-matching to protect you — often from nothing.',
  },
  {
    icon: '🔑',
    truth: 'The only thing that ends this is a decision.',
    sub: 'Not more information. Not more exploration. A choice, made now, with imperfect data.',
  },
];

function MirrorReflection({ onDone }) {
  const [step, setStep]     = useState(0);
  const [answer, setAnswer] = useState('');
  const [phase, setPhase]   = useState('truths'); // 'truths' | 'question' | 'done'
  const current = MIRROR_TRUTHS[step];
  const isLastTruth = step === MIRROR_TRUTHS.length - 1;

  function handleNext() {
    if (isLastTruth) setPhase('question');
    else setStep(s => s + 1);
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {phase === 'truths' && (
          <motion.div key={`truth-${step}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center mb-6">
              {MIRROR_TRUTHS.map((_, i) => (
                <motion.div key={i} animate={{ scale: i === step ? 1.3 : 1 }}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === step ? 24 : 8,
                    background: i <= step ? '#f472b6' : 'rgba(244,114,182,0.15)',
                  }} />
              ))}
            </div>

            {/* Truth card */}
            <motion.div
              initial={{ scale: 0.96 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 mb-5 text-center"
              style={{ background: 'linear-gradient(135deg,rgba(244,114,182,0.06),rgba(167,139,250,0.06))', border: '1.5px solid rgba(244,114,182,0.2)' }}
            >
              <div className="text-4xl mb-3">{current.icon}</div>
              <p className="text-base font-black leading-snug mb-2" style={{ color: '#831843' }}>
                "{current.truth}"
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(50,20,35,0.55)' }}>
                {current.sub}
              </p>
            </motion.div>

            <button onClick={handleNext}
              className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#f9a8d4,#f472b6)', color: '#fff', boxShadow: '0 4px 20px rgba(244,114,182,0.3)' }}>
              {isLastTruth ? 'I see it — now what?' : 'I see it →'}
            </button>
          </motion.div>
        )}

        {phase === 'question' && (
          <motion.div key="question" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">✍️</div>
              <h3 className="text-lg font-black leading-snug mb-1" style={{ color: '#831843' }}>
                If you already knew the answer — what is it?
              </h3>
              <p className="text-xs" style={{ color: 'rgba(131,24,67,0.5)' }}>
                Don't think. Don't justify. Write the first thing that surfaces.
              </p>
            </div>
            <textarea
              autoFocus
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="I already know that I…"
              rows={4}
              className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none mb-3"
              style={{ background: 'rgba(244,114,182,0.05)', border: '1.5px solid rgba(244,114,182,0.3)', color: '#1e0a14' }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && answer.trim()) onDone(answer.trim()); }}
            />
            <button
              onClick={() => answer.trim() && onDone(answer.trim())}
              disabled={!answer.trim()}
              className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
              style={{
                background: answer.trim() ? 'linear-gradient(135deg,#f9a8d4,#f472b6)' : 'rgba(244,114,182,0.12)',
                color: answer.trim() ? '#fff' : 'rgba(244,114,182,0.4)',
                boxShadow: answer.trim() ? '0 4px 20px rgba(244,114,182,0.3)' : 'none',
              }}>
              That's my truth →
            </button>
            <p className="text-center text-[9px] mt-2" style={{ color: 'rgba(131,24,67,0.3)' }}>Cmd+Enter to continue</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Evidence flip ─────────────────────────────────────────────────────────────
function EvidenceFlip({ onDone }) {
  const [items, setItems] = useState([]);
  const [val, setVal] = useState('');
  const MAX = 3;

  function add() {
    const t = val.trim();
    if (!t || items.length >= MAX) return;
    setItems(p => [...p, t]);
    setVal('');
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(244,114,182,0.6)' }}>Evidence Check</p>
      <h3 className="text-lg font-black mb-1 leading-snug" style={{ color: '#1e0a14' }}>Name 3 things that could go RIGHT.</h3>
      <p className="text-xs mb-4" style={{ color: 'rgba(50,20,35,0.5)' }}>
        You've been cataloguing risks. Now counterbalance it. What are 3 realistic positive outcomes?
      </p>
      <div className="space-y-2 mb-3">
        {items.map((it, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(134,239,172,0.15)', border: '1px solid rgba(134,239,172,0.35)', color: '#14532d' }}>
            <span className="text-green-500 font-bold shrink-0">✓</span>{it}
          </motion.div>
        ))}
        {items.length < MAX && (
          <div className="flex gap-2">
            <input autoFocus value={val} onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') add(); }}
              placeholder={`Positive outcome ${items.length + 1}…`}
              className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'rgba(244,114,182,0.05)', border: '1.5px solid rgba(244,114,182,0.25)', color: '#1e0a14' }} />
            <button onClick={add} disabled={!val.trim()} className="px-3 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(134,239,172,0.2)', color: '#14532d', border: '1px solid rgba(134,239,172,0.35)' }}>+</button>
          </div>
        )}
      </div>
      {items.length === MAX && (
        <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => onDone(items)}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-white mt-2"
          style={{ background: 'linear-gradient(135deg,#f9a8d4,#f472b6)', boxShadow: '0 4px 16px rgba(244,114,182,0.3)' }}>
          Good — that's the other side →
        </motion.button>
      )}
    </div>
  );
}

// ── Commitment builder ─────────────────────────────────────────────────────────
function CommitmentBuilder({ onDone }) {
  const [action, setAction] = useState('');
  const [timing, setTiming] = useState('');
  const TIMINGS = ['right now', 'today', 'tomorrow morning', 'this week'];
  const sentence = action.trim() && timing ? `I will ${action.trim()} — ${timing}.` : '';

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(244,114,182,0.6)' }}>The Commitment</p>
      <h3 className="text-lg font-black mb-1 leading-snug" style={{ color: '#1e0a14' }}>One action. One deadline.</h3>
      <p className="text-xs mb-4" style={{ color: 'rgba(50,20,35,0.5)' }}>
        Not a plan. Not a list. One specific thing you will do, with a time attached to it.
      </p>
      <input autoFocus value={action} onChange={e => setAction(e.target.value)}
        placeholder="I will…"
        className="w-full rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none"
        style={{ background: 'rgba(244,114,182,0.05)', border: '1.5px solid rgba(244,114,182,0.25)', color: '#1e0a14' }} />
      <div className="flex flex-wrap gap-2 mb-4">
        {TIMINGS.map(t => (
          <button key={t} onClick={() => setTiming(t)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: timing === t ? 'linear-gradient(135deg,#f9a8d4,#f472b6)' : 'rgba(244,114,182,0.08)',
              color: timing === t ? '#fff' : 'rgba(131,24,67,0.6)',
              border: `1px solid ${timing === t ? '#f472b6' : 'rgba(244,114,182,0.2)'}`,
            }}>
            {t}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {sentence && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-2xl text-sm font-bold text-center"
            style={{ background: 'linear-gradient(135deg,rgba(244,114,182,0.1),rgba(167,139,250,0.1))',
              border: '1.5px solid rgba(244,114,182,0.3)', color: '#831843' }}>
            "{sentence}"
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => sentence && onDone(sentence)} disabled={!sentence}
        className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all"
        style={{
          background: sentence ? 'linear-gradient(135deg,#f9a8d4,#f472b6)' : 'rgba(244,114,182,0.12)',
          color: sentence ? '#fff' : 'rgba(244,114,182,0.4)',
          boxShadow: sentence ? '0 4px 16px rgba(244,114,182,0.3)' : 'none',
        }}>
        Lock it in →
      </button>
    </div>
  );
}

// ── Chain-breaking questions ───────────────────────────────────────────────────
const CORE_QUESTIONS = [
  { id: 'want',   prompt: 'Forget everything. What do you actually want?',
    sub: 'Remove obligations, "should"s, other people\'s expectations. What do YOU want?',
    placeholder: 'What I want is…', type: 'goal' },
  { id: 'choose', prompt: 'No more time. What would you choose — right now?',
    sub: '10-second rule. Don\'t think. What does your gut say first?',
    placeholder: 'I would choose…', type: 'decision' },
  { id: 'worst',  prompt: 'What\'s the REALISTIC worst case — not the one in your head?',
    sub: 'Strip out the catastrophe. What\'s the most likely negative outcome in plain terms?',
    placeholder: 'Realistically, the worst is…', type: 'fear' },
];

function CoreQuestions({ onDone }) {
  const [step, setStep]     = useState(0);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState('');
  const q = CORE_QUESTIONS[step];
  const isLast = step === CORE_QUESTIONS.length - 1;

  function handleNext() {
    if (!current.trim()) return;
    const updated = { ...answers, [q.id]: { text: current.trim(), type: q.type } };
    setAnswers(updated);
    setCurrent('');
    if (isLast) onDone(updated);
    else setStep(s => s + 1);
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {CORE_QUESTIONS.map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i <= step ? '#f472b6' : 'rgba(244,114,182,0.15)' }} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(244,114,182,0.55)' }}>
            Question {step + 1} of {CORE_QUESTIONS.length}
          </p>
          <h3 className="text-base font-black mb-1 leading-snug" style={{ color: '#1e0a14' }}>{q.prompt}</h3>
          <p className="text-xs mb-3" style={{ color: 'rgba(50,20,35,0.5)' }}>{q.sub}</p>
          <textarea autoFocus value={current} onChange={e => setCurrent(e.target.value)}
            placeholder={q.placeholder} rows={3}
            className="w-full rounded-2xl px-3 py-2.5 text-sm resize-none focus:outline-none"
            style={{ background: 'rgba(244,114,182,0.05)', border: '1.5px solid rgba(244,114,182,0.25)', color: '#1e0a14' }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleNext(); }} />
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between mt-3">
        {step > 0 ? (
          <button onClick={() => { setStep(s => s - 1); setCurrent(answers[CORE_QUESTIONS[step - 1].id]?.text || ''); }}
            className="text-xs font-semibold" style={{ color: 'rgba(131,24,67,0.4)' }}>← back</button>
        ) : <div />}
        <button onClick={handleNext} disabled={!current.trim()}
          className="px-5 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: current.trim() ? 'linear-gradient(135deg,#f9a8d4,#f472b6)' : 'rgba(244,114,182,0.12)',
            color: current.trim() ? '#fff' : 'rgba(244,114,182,0.4)',
            boxShadow: current.trim() ? '0 4px 16px rgba(244,114,182,0.3)' : 'none',
          }}>
          {isLast ? 'Done →' : 'Next →'}
        </button>
      </div>
      <p className="text-center text-[9px] mt-2" style={{ color: 'rgba(131,24,67,0.3)' }}>Cmd+Enter to continue</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN — 6-stage pattern interrupt
// ═════════════════════════════════════════════════════════════════════════════
const STAGES = ['intro', 'breathe', 'pattern', 'questions', 'evidence', 'commit', 'done'];
const STAGE_META = [
  { label: 'Pause' }, { label: 'Mirror' }, { label: 'Pattern' },
  { label: 'Clarify' }, { label: 'Flip' }, { label: 'Commit' },
];

export default function OverthinkingIntervention({ onComplete, onDismiss, dominantType }) {
  const [stage, setStage]       = useState('intro');
  const [collected, setCollected] = useState({});
  const scrollRef = useRef(null);

  const patternKey = dominantType === 'fear' ? 'fear_spiral'
    : dominantType === 'unknown' ? 'analysis_paralysis'
    : 'rumination';
  const pattern = PATTERNS[patternKey];
  const stageIndex = STAGES.indexOf(stage);
  const pct = stageIndex > 0 ? Math.round((stageIndex / (STAGES.length - 1)) * 100) : 0;

  function next(data = {}) {
    setCollected(p => ({ ...p, ...data }));
    const nextStage = STAGES[stageIndex + 1];
    setStage(nextStage);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  function finish(commitSentence) {
    const finalData = { ...collected, commit: commitSentence };
    setStage('done');
    // Build backward-compatible answers shape for App.jsx
    const legacy = {};
    if (finalData.insight) legacy.insight = { text: finalData.insight, type: 'goal' };
    if (finalData.qa) Object.entries(finalData.qa).forEach(([k, v]) => { legacy[k] = v; });
    if (finalData.positives) finalData.positives.forEach((p, i) => { legacy[`positive_${i}`] = { text: p, type: 'opportunity' }; });
    legacy.commit = { text: commitSentence, type: 'outcome' };
    setTimeout(() => onComplete(legacy), 1600);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto"
      style={{ background: 'rgba(20,5,12,0.75)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        ref={scrollRef}
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-lg rounded-3xl mb-8"
        style={{ background: '#fff', boxShadow: '0 32px 96px rgba(244,114,182,0.28)', overflow: 'hidden' }}
      >
        {/* ── Sticky header ───────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 sticky top-0 z-10"
          style={{ background: 'linear-gradient(135deg,#fff1f5,#fce7f3)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                style={{ background: 'rgba(244,114,182,0.2)', color: '#be185d' }}>
                🧠 Pattern Interrupt
              </span>
              <h2 className="text-sm font-black leading-tight" style={{ color: '#831843' }}>
                Break the overthinking loop
              </h2>
            </div>
            <button onClick={onDismiss}
              className="text-rose-300 hover:text-rose-500 transition-colors text-xl ml-4 shrink-0 leading-none">×</button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(244,114,182,0.12)' }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#f9a8d4,#f472b6,#a78bfa)' }} />
          </div>
          <div className="flex justify-between mt-1.5">
            {STAGE_META.map(({ label }, i) => {
              const active = i === stageIndex - 1;
              const past   = i < stageIndex - 1;
              return (
                <span key={label} className="text-[8px] font-bold transition-all"
                  style={{ color: active ? '#f472b6' : past ? 'rgba(244,114,182,0.5)' : 'rgba(244,114,182,0.2)' }}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="px-6 pb-7 pt-5">
          <AnimatePresence mode="wait">

            {/* INTRO */}
            {stage === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="rounded-2xl p-4 mb-5 text-center"
                  style={{ background: `linear-gradient(135deg,${pattern.color}14,${pattern.color}08)`, border: `1.5px solid ${pattern.color}30` }}>
                  <div className="text-4xl mb-2">{pattern.emoji}</div>
                  <p className="text-sm font-bold mb-0.5" style={{ color: pattern.color }}>{pattern.name} detected</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(50,20,35,0.6)' }}>{pattern.desc}</p>
                  <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: `${pattern.color}18`, color: pattern.color }}>{pattern.bias}</span>
                </div>
                <p className="text-xs mb-5 text-center" style={{ color: 'rgba(131,24,67,0.6)' }}>
                  A 5-step process. ~3 minutes. It will actually move you forward.
                </p>
                <div className="space-y-2 mb-6">
                  {[['🪞','The mirror — 4 hard truths + 1 reflection you write'],
                    ['🔍','Name the pattern that\'s running you'],
                    ['✍️','3 chain-breaking questions (you write the answers)'],
                    ['🔄','Flip the evidence — list 3 things that could go right'],
                    ['🎯','One concrete commitment with a real deadline'],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(50,20,35,0.65)' }}>
                      <span className="text-base shrink-0">{icon}</span>{text}
                    </div>
                  ))}
                </div>
                <button onClick={() => next()}
                  className="w-full py-3 rounded-2xl font-black text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#f9a8d4,#f472b6)', boxShadow: '0 6px 24px rgba(244,114,182,0.35)' }}>
                  I'm ready — break this loop →
                </button>
                <button onClick={onDismiss} className="w-full mt-2 py-2 text-xs"
                  style={{ color: 'rgba(131,24,67,0.35)' }}>
                  Not now — continue exploring
                </button>
              </motion.div>
            )}

            {/* MIRROR */}
            {stage === 'breathe' && (
              <motion.div key="breathe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(244,114,182,0.6)' }}>Step 1 — The Mirror</p>
                <MirrorReflection onDone={insight => next({ insight })} />
              </motion.div>
            )}

            {/* PATTERN */}
            {stage === 'pattern' && (
              <motion.div key="pattern" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(244,114,182,0.6)' }}>Step 2 — Name it</p>
                <h3 className="text-lg font-black mb-3" style={{ color: '#1e0a14' }}>
                  Your brain is running {pattern.emoji} <span style={{ color: pattern.color }}>{pattern.name}</span>
                </h3>
                <div className="rounded-2xl p-4 mb-4 text-sm leading-relaxed"
                  style={{ background: `${pattern.color}0d`, border: `1px solid ${pattern.color}28`, color: 'rgba(50,20,35,0.75)' }}>
                  {pattern.desc}
                </div>
                <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)' }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'rgba(244,114,182,0.7)' }}>What's actually happening</p>
                  <ul className="space-y-1.5 text-xs" style={{ color: 'rgba(50,20,35,0.65)' }}>
                    <li>→ Your amygdala has hijacked your prefrontal cortex</li>
                    <li>→ You're generating scenarios, not evaluating real options</li>
                    <li>→ More exploration won't help — only a decision breaks the loop</li>
                  </ul>
                </div>
                <p className="text-sm font-bold mb-4 text-center" style={{ color: '#be185d' }}>
                  You are not your thoughts. This is a pattern. You can interrupt it.
                </p>
                <button onClick={() => next()}
                  className="w-full py-2.5 rounded-2xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#f9a8d4,#f472b6)', boxShadow: '0 4px 16px rgba(244,114,182,0.28)' }}>
                  Understood — break the pattern →
                </button>
              </motion.div>
            )}

            {/* QUESTIONS */}
            {stage === 'questions' && (
              <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(244,114,182,0.6)' }}>Step 3 — Chain-breaking</p>
                <CoreQuestions onDone={qa => next({ qa })} />
              </motion.div>
            )}

            {/* EVIDENCE */}
            {stage === 'evidence' && (
              <motion.div key="evidence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(244,114,182,0.6)' }}>Step 4 — Flip the evidence</p>
                <EvidenceFlip onDone={positives => next({ positives })} />
              </motion.div>
            )}

            {/* COMMIT */}
            {stage === 'commit' && (
              <motion.div key="commit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(244,114,182,0.6)' }}>Step 5 — The commitment</p>
                <CommitmentBuilder onDone={sentence => finish(sentence)} />
              </motion.div>
            )}

            {/* DONE */}
            {stage === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 text-center">
                <div className="text-5xl mb-3">🎯</div>
                <h3 className="text-xl font-black mb-2" style={{ color: '#831843' }}>The loop is broken.</h3>
                <p className="text-sm mb-4" style={{ color: 'rgba(131,24,67,0.6)' }}>Your answers are becoming nodes on the map…</p>
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ scale: [1,1.3,1] }}
                      transition={{ delay: i * 0.2, repeat: Infinity, duration: 0.9 }}
                      className="w-2 h-2 rounded-full" style={{ background: '#f472b6' }} />
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
