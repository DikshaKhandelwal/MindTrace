import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { updateTodayLog, CAFFEINE_TYPES, laptopStatus } from '../data/sleepStore';

// ── Bad habit toggle definitions ──────────────────────────────────────────
const BAD_HABITS = [
  { key: 'lateSnack',    icon: '🍕', label: 'Late Snack',     desc: 'Ate 2h before bed',      penalty: -8  },
  { key: 'alcohol',      icon: '🍷', label: 'Alcohol',        desc: 'Disrupts deep sleep',    penalty: -12 },
  { key: 'bingeWatch',   icon: '📺', label: 'Binge Watch',    desc: 'Streaming >2h evening',  penalty: -10 },
  { key: 'gaming',       icon: '🎮', label: 'Late Gaming',    desc: 'Keeps brain wired',      penalty: -9  },
  { key: 'socialScroll', icon: '📱', label: 'Doom Scroll',    desc: 'Social media in bed',    penalty: -10 },
  { key: 'highStress',   icon: '😰', label: 'High Stress',    desc: 'Cortisol spike',         penalty: -9  },
  { key: 'lateExercise', icon: '🏃', label: 'Late Workout',   desc: 'Adrenaline within 3h',   penalty: -7  },
  { key: 'lateNap',      icon: '💤', label: 'Afternoon Nap',  desc: 'Napped after 3 PM',      penalty: -8  },
  { key: 'blueLight',    icon: '💡', label: 'No Blue Filter', desc: 'Bright screen at night', penalty: -6  },
];

const GOOD_HABIT = { key: 'earlyDim', icon: '🌅', label: 'Dimmed Early', desc: 'Screen dimmed after 9 PM', bonus: 5 };

export default function LogPanel({ log, onChange }) {
  const [saved, setSaved]   = useState(false);
  const [laptop, setLaptop] = useState(() => laptopStatus());

  // Refresh laptop status every 60s
  useEffect(() => {
    const id = setInterval(() => setLaptop(laptopStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  function handleChange(patch) {
    const next = { ...log, ...patch };
    updateTodayLog(patch);
    onChange(next);
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  }

  const severityBorder = { ok: 'border-indigo-700/30 bg-indigo-900/30', warn: 'border-yellow-500/40 bg-yellow-900/20', danger: 'border-red-500/50 bg-red-900/25' };
  const severityText   = { ok: 'text-indigo-400', warn: 'text-yellow-300', danger: 'text-red-300' };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-mono text-indigo-200 text-base font-bold tracking-widest uppercase mb-1">
        Log Your Day
      </h3>

      {/* ── Auto-detected laptop session ──────────────────────────────────── */}
      <div className={`rounded-lg border px-4 py-3 ${severityBorder[laptop.severity]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-mono text-sm font-bold ${severityText[laptop.severity]}`}>
              💻 {laptop.message}
            </p>
            {laptop.durationText && (
              <p className="text-indigo-400 text-xs mt-0.5">{laptop.durationText} today</p>
            )}
          </div>
          <span className="text-xs font-mono text-indigo-500">{laptop.timeStr}</span>
        </div>
        {laptop.severity !== 'ok' && (
          <p className="text-xs font-mono mt-1.5" style={{ color: laptop.severity === 'danger' ? '#fca5a5' : '#fcd34d' }}>
            {laptop.severity === 'danger'
              ? 'Luna is very upset with you right now 👻'
              : 'Consider wrapping up soon — sleep is calling 🌙'}
          </p>
        )}
      </div>

      {/* Caffeine type */}
      <div className="flex flex-col gap-1">
        <label className="text-indigo-300 text-xs tracking-wider uppercase">Caffeine Intake</label>
        <div className="grid grid-cols-3 gap-1.5">
          {CAFFEINE_TYPES.map((c) => (
            <button
              key={c.key}
              onClick={() => handleChange({ caffeineType: c.key })}
              className={`rounded-lg py-1.5 px-2 text-xs font-mono flex items-center gap-1 transition-all border ${
                log.caffeineType === c.key
                  ? 'bg-indigo-500 border-indigo-300 text-white'
                  : 'bg-indigo-900/40 border-indigo-700/40 text-indigo-200 hover:bg-indigo-800/50'
              }`}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Last caffeine time */}
      <div className="flex flex-col gap-1">
        <label className="text-indigo-300 text-xs tracking-wider uppercase">Last Caffeine Time</label>
        <input
          type="time"
          value={log.caffeineTime || ''}
          onChange={(e) => handleChange({ caffeineTime: e.target.value })}
          className="bg-indigo-900/50 border border-indigo-600/40 rounded-lg px-3 py-2 text-indigo-100 font-mono text-sm focus:outline-none focus:border-indigo-400 w-full"
        />
        {!log.caffeineTime && (
          <p className="text-indigo-400 text-xs">No caffeine today? Lucky you 🌙</p>
        )}
      </div>

      {/* Target bedtime */}
      <div className="flex flex-col gap-1">
        <label className="text-indigo-300 text-xs tracking-wider uppercase">Set Bedtime Goal</label>
        <input
          type="time"
          value={log.targetBedtime || '23:00'}
          onChange={(e) => handleChange({ targetBedtime: e.target.value })}
          className="bg-indigo-900/50 border border-indigo-600/40 rounded-lg px-3 py-2 text-indigo-100 font-mono text-sm focus:outline-none focus:border-indigo-400 w-full"
        />
      </div>

      {/* ── Sleep-breaking activities ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="text-indigo-300 text-xs tracking-wider uppercase">
          Sleep Breakers <span className="text-red-400 normal-case opacity-80">(tap what applies today)</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {BAD_HABITS.map((h) => {
            const active = !!log[h.key];
            return (
              <motion.button
                key={h.key}
                onClick={() => handleChange({ [h.key]: !active })}
                whileTap={{ scale: 0.92 }}
                title={`${h.desc} (${h.penalty})`}
                className={`rounded-lg py-2 px-1.5 text-xs font-mono flex flex-col items-center gap-0.5 transition-all border ${
                  active
                    ? 'bg-red-900/60 border-red-500/60 text-red-200'
                    : 'bg-indigo-900/30 border-indigo-700/30 text-indigo-400 hover:bg-indigo-800/40'
                }`}
              >
                <span className="text-base">{h.icon}</span>
                <span className="leading-tight text-center">{h.label}</span>
                {active && <span className="text-red-400 text-[10px]">{h.penalty}</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Good habits ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="text-indigo-300 text-xs tracking-wider uppercase">
          Good Habits <span className="text-green-400 normal-case opacity-80">(tap what you did 🌟)</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <HabitToggle
            icon="🛏️" label="Phone Downtime" desc="Phone away 30 min" bonus="+10"
            active={!!log.phoneDowntime}
            onToggle={() => handleChange({ phoneDowntime: !log.phoneDowntime })}
          />
          <HabitToggle
            icon={GOOD_HABIT.icon} label={GOOD_HABIT.label} desc={GOOD_HABIT.desc} bonus={`+${GOOD_HABIT.bonus}`}
            active={!!log[GOOD_HABIT.key]}
            onToggle={() => handleChange({ [GOOD_HABIT.key]: !log[GOOD_HABIT.key] })}
          />
        </div>
      </div>

      {/* Saved flash */}
      <motion.div
        animate={{ opacity: saved ? 1 : 0, y: saved ? 0 : 4 }}
        transition={{ duration: 0.3 }}
        className="text-indigo-400 text-xs text-right font-mono pointer-events-none"
      >
        ✓ saved
      </motion.div>
    </div>
  );
}

function HabitToggle({ icon, label, desc, bonus, active, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.94 }}
      className={`rounded-lg py-2 px-3 text-xs font-mono flex items-center gap-2 transition-all border ${
        active
          ? 'bg-green-900/50 border-green-500/50 text-green-200'
          : 'bg-indigo-900/30 border-indigo-700/30 text-indigo-400 hover:bg-indigo-800/40'
      }`}
    >
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="text-left">
        <p className="leading-tight">{label}</p>
        <p className="text-[10px] opacity-60">{active ? bonus : desc}</p>
      </div>
    </motion.button>
  );
}
