import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Wind, BookOpen, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';
import { CRISIS_LINES, BREATHING_STEPS, ARTICLES } from '../data/resources';
import { CATEGORY_META } from '../data/posts';

/* ---------- Breathing Exercise ---------- */
function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [seconds, setSeconds] = useState(BREATHING_STEPS[0].duration);
  const intervalRef = useRef(null);

  function advance(prevStep, prevSec) {
    if (prevSec > 1) return { step: prevStep, sec: prevSec - 1 };
    const next = (prevStep + 1) % BREATHING_STEPS.length;
    return { step: next, sec: BREATHING_STEPS[next].duration };
  }

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setStepIdx(prev => {
        const { step, sec } = advance(prev, seconds);
        setSeconds(sec);
        return step;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line

  function toggle() {
    if (!running) {
      setStepIdx(0);
      setSeconds(BREATHING_STEPS[0].duration);
    }
    setRunning(v => !v);
  }

  const step = BREATHING_STEPS[stepIdx];
  const progress = ((step.duration - seconds) / step.duration) * 100;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Wind size={16} className="text-teal-500" />
        <h3 className="font-semibold text-stone-800">Box Breathing (4-4-6-2)</h3>
      </div>
      <p className="text-xs text-stone-500 mb-5">A simple calming breath pattern used to reduce stress and ground you in the present.</p>

      {/* Step indicator */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {BREATHING_STEPS.map((s, i) => (
          <div
            key={s.phase}
            className={`flex-1 min-w-[60px] text-center py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
              i === stepIdx && running
                ? `${s.colorClass} ${s.textClass} shadow-sm`
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            <div className="font-semibold">{s.phase}</div>
            <div className="text-stone-400">{s.duration}s</div>
          </div>
        ))}
      </div>

      {/* Live display */}
      {running && (
        <div className="text-center mb-5">
          <motion.div
            key={`${stepIdx}-${seconds}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-bold ${step.textClass} mb-1`}
          >
            {seconds}
          </motion.div>
          <div className="text-sm text-stone-500">{step.phase}</div>
          <div className={`mt-3 mx-auto h-1.5 w-40 rounded-full ${step.colorClass} opacity-30 overflow-hidden`}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9 }}
              className={`h-full ${step.colorClass}`}
            />
          </div>
        </div>
      )}

      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
          running
            ? 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            : 'bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-sm hover:opacity-90'
        }`}
      >
        {running ? <><Pause size={14} /> Stop</> : <><Play size={14} /> Start Breathing</>}
      </button>
    </div>
  );
}

/* ---------- Article accordion ---------- */
function ArticleItem({ article }) {
  const [open, setOpen] = useState(false);
  const meta = CATEGORY_META[article.category] ?? { label: article.category, bg: 'bg-stone-100', text: 'text-stone-600' };

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white/50 mb-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-50/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${meta.bg} ${meta.text}`}>
            {meta.label}
          </span>
          <span className="text-sm font-medium text-stone-700 truncate">{article.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400 flex-shrink-0 ml-2">
          <span>{article.readTime}</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
              {article.summary}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Main component ---------- */
export default function ResourceHub() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-1">Resource Hub</h2>
      <p className="text-stone-500 text-sm mb-8">Crisis support, breathing tools, and articles to help you navigate difficult moments.</p>

      {/* Crisis lines */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Phone size={16} className="text-rose-500" />
          <h3 className="font-semibold text-stone-800">Crisis & Support Lines</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CRISIS_LINES.map(line => (
            <div key={line.name} className="glass-card border border-rose-100 p-4">
              <div className="font-semibold text-rose-700 text-sm mb-0.5">{line.name}</div>
              <div className="text-base font-bold text-stone-800">{line.text}</div>
              <div className="text-xs text-stone-400 mt-1">{line.region}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Breathing */}
      <section className="mb-8">
        <BreathingExercise />
      </section>

      {/* Articles */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-indigo-500" />
          <h3 className="font-semibold text-stone-800">Reading</h3>
        </div>
        {ARTICLES.map(a => <ArticleItem key={a.id} article={a} />)}
      </section>
    </div>
  );
}
