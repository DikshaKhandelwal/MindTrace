import { motion } from 'framer-motion';
import GhostCharacter from './GhostCharacter';
import LogPanel from './LogPanel';
import { caffeineLevel, moonCookies, getStreak, CAFFEINE_TYPES, laptopStatus } from '../data/sleepStore';

export default function NightlyDashboard({ log, score, ghostState, onChange }) {
  const caffeinePct = caffeineLevel(log);
  const cookies     = moonCookies();
  const streak      = getStreak();
  const caffeineInfo = CAFFEINE_TYPES.find((c) => c.key === log.caffeineType);
  const laptop      = laptopStatus();

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen sleep-bg flex flex-col items-center justify-start py-10 px-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-2xl">🌙</span>
          <h1 className="font-mono text-indigo-200 text-2xl tracking-widest font-bold">
            SLEEP GUARDIAN
          </h1>
          <span className="text-2xl">🌙</span>
        </div>
        <p className="text-indigo-400 text-xs tracking-widest font-mono">
          Module 06 · {timeStr}
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full max-w-3xl bg-indigo-950/70 border border-indigo-700/30 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT — Ghost */}
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-10 border-b md:border-b-0 md:border-r border-indigo-700/20">
            <h2 className="font-mono text-indigo-200 text-base tracking-widest font-bold">
              Luna's Nightly Status
            </h2>
            <GhostCharacter state={ghostState} size={170} />
            <GhostLabel state={ghostState} score={score} streak={streak} />
          </div>

          {/* RIGHT — Log Panel */}
          <div className="px-8 py-10">
            <LogPanel log={log} onChange={onChange} />
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5"
      >
        {/* Zzz Vitality */}
        <StatCard
          title="Zzz Vitality"
          value={`${score}%`}
          color={vitalityColor(score)}
          warning={score < 50 ? 'Rough night ahead… 😵' : score < 72 ? 'So-so pattern' : null}
        >
          <ProgressBar pct={score} color={vitalityColor(score)} />
        </StatCard>

        {/* Caffeine Level */}
        <StatCard
          title="Caffeine"
          value={`${caffeinePct}%`}
          color={caffeinePct > 60 ? '#fb923c' : '#a5f3fc'}
          warning={
            caffeinePct > 75
              ? `⚡ ${caffeineInfo?.icon ?? '☕'} Still wired`
              : caffeinePct > 40
              ? `${caffeineInfo?.icon ?? '☕'} Fading…`
              : null
          }
        >
          <ProgressBar pct={caffeinePct} color={caffeinePct > 60 ? '#fb923c' : '#818cf8'} />
        </StatCard>

        {/* Laptop session */}
        <StatCard
          title="Laptop Time"
          value={laptop.timeStr}
          color={laptop.severity === 'danger' ? '#fca5a5' : laptop.severity === 'warn' ? '#fcd34d' : '#a5f3fc'}
          warning={laptop.durationText || null}
        >
          <ProgressBar
            pct={Math.min(((laptop.hour >= 20 ? laptop.hour - 20 : 0) / 4) * 100, 100)}
            color={laptop.severity === 'danger' ? '#f87171' : laptop.severity === 'warn' ? '#fbbf24' : '#818cf8'}
          />
        </StatCard>

        {/* Moon Cookies */}
        <StatCard
          title="Sleep Treats"
          value={`${cookies} 🍪`}
          color="#c084fc"
          warning={streak > 0 ? `${streak} night streak 🔥` : null}
          positiveWarning
        >
          <MoonCookieDots count={Math.min(cookies, 8)} />
        </StatCard>
      </motion.div>

      {/* Tips row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.7 }}
        className="mt-5 text-center"
      >
        <p className="text-indigo-500 text-xs font-mono">{getTip(ghostState, laptop)}</p>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

function GhostLabel({ state, score, streak }) {
  const labels = {
    fresh: { text: 'Luna is glowing ✨', color: 'text-violet-300' },
    tired: { text: 'Luna needs rest 😴', color: 'text-indigo-300' },
    exhausted: { text: 'Luna is exhausted 💤', color: 'text-indigo-400' },
  };
  const l = labels[state] || labels.tired;
  return (
    <div className="text-center">
      <p className={`font-mono text-sm font-bold ${l.color}`}>{l.text}</p>
      <p className="text-indigo-500 text-xs mt-0.5 font-mono">
        Score: {score}/100
        {streak > 0 && <span className="ml-2">🔥 {streak}</span>}
      </p>
    </div>
  );
}

function StatCard({ title, value, color, warning, positiveWarning, children }) {
  return (
    <div className="bg-indigo-950/70 border border-indigo-700/20 rounded-xl px-5 py-4 flex flex-col gap-2 shadow-lg">
      <p className="text-indigo-400 text-xs font-mono tracking-widest uppercase">{title}</p>
      <p className="font-mono font-bold text-xl" style={{ color }}>{value}</p>
      {children}
      {warning && (
        <p
          className="text-xs font-mono"
          style={{ color: positiveWarning ? '#86efac' : '#fb923c' }}
        >
          {warning}
        </p>
      )}
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div className="w-full h-2.5 bg-indigo-900/60 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
      />
    </div>
  );
}

function MoonCookieDots({ count }) {
  return (
    <div className="flex flex-wrap gap-1 mt-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.05 * i, type: 'spring', stiffness: 400 }}
          style={{ fontSize: '14px' }}
        >
          🍪
        </motion.span>
      ))}
    </div>
  );
}

function vitalityColor(score) {
  if (score >= 72) return '#86efac';
  if (score >= 50) return '#fcd34d';
  return '#fb923c';
}

function getTip(state, laptop) {
  if (laptop?.severity === 'danger') return '🚨 Close the laptop. Luna is begging you. Your brain needs rest, not more screen.';
  if (laptop?.severity === 'warn')   return '🌙 Wind-down window: dim the screen, put the phone away, close the tabs.';
  const tips = {
    fresh:     '🌟 Perfect habits! Luna is glowing proud of you tonight.',
    tired:     '😌 Try cutting caffeine earlier, skip the late snack, and set a firm lights-out time.',
    exhausted: '😵 Multiple sleep-breakers active. Close everything, drink water, lie down — now.',
  };
  return tips[state] ?? tips.tired;
}
