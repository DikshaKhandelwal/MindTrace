/**
 * ActivityLogger.jsx
 * Daily developer check-in form: mood, focus, hours, meetings, breaks, overtime.
 * Stores to localStorage; shows 14-day history heatmap. No mock data.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle, Flame, Coffee, Users, Clock, Star } from 'lucide-react';
import { scoreActivitySignals, BDStore } from '../data/burnoutSignals';

const BLK = '1.5px solid #111';
const today = () => new Date().toISOString().slice(0, 10);

const MOOD_LABELS  = ['', 'Exhausted', 'Drained', 'Okay', 'Good', 'Great'];
const FOCUS_LABELS = ['', 'Scattered', 'Distracted', 'Some focus', 'Focused', 'Flow state'];

function EmojiPicker({ value, onChange, count = 5, labels }) {
  const emojis = ['😵', '😔', '😐', '🙂', '😄'];
  return (
    <div className="flex gap-1.5">
      {emojis.map((e, i) => (
        <button key={i + 1} onClick={() => onChange(i + 1)}
          title={labels[i + 1]}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all text-sm"
          style={{
            border: value === i + 1 ? '2px solid #111' : '1.5px solid rgba(0,0,0,0.15)',
            background: value === i + 1 ? '#fff7ed' : '#fafafa',
            boxShadow: value === i + 1 ? '2px 2px 0 #111' : 'none',
          }}>
          {e}
          <span className="text-[7px] font-mono text-black/40">{i + 1}</span>
        </button>
      ))}
    </div>
  );
}

function NumberInput({ value, onChange, min = 0, max = 24, label }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, value - 1))}
        className="w-6 h-6 font-black text-sm flex items-center justify-center"
        style={{ border: BLK, background: '#fff' }}>−</button>
      <span className="text-base font-black font-mono w-6 text-center">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
        className="w-6 h-6 font-black text-sm flex items-center justify-center"
        style={{ border: BLK, background: '#fff' }}>+</button>
    </div>
  );
}

// ── 14-day heatmap ────────────────────────────────────────────────────────────
function DayHeatmap({ logs }) {
  // Last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });

  const logMap = Object.fromEntries(logs.map(l => [l.date, l]));

  const burnoutColor = (log) => {
    if (!log) return '#e5e7eb';
    const score = ((5 - log.mood) + (5 - log.focus) + Math.max(0, log.hoursWorked - 8) + log.overtime) / 4;
    if (score > 3) return '#dc2626';
    if (score > 2) return '#f97316';
    if (score > 1) return '#eab308';
    return '#22c55e';
  };

  return (
    <div>
      <p className="text-[9px] font-black font-mono uppercase tracking-widest text-black/40 mb-2">
        14-Day Wellbeing Heatmap
      </p>
      <div className="flex gap-1 items-end">
        {days.map(d => {
          const log = logMap[d];
          return (
            <div key={d} title={d + (log ? ` · mood:${log.mood} focus:${log.focus}` : ' · no data')}
              className="flex-1 rounded-sm"
              style={{ height: 24, background: burnoutColor(log), opacity: log ? 1 : 0.35 }} />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] font-mono text-black/30">14 days ago</span>
        <span className="text-[8px] font-mono text-black/30">Today</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ActivityLogger({ onScoreReady }) {
  const existingToday = BDStore.getActivityLogs().find(l => l.date === today()) || {};

  const [form, setForm] = useState({
    mood:        existingToday.mood        ?? 3,
    focus:       existingToday.focus       ?? 3,
    hoursWorked: existingToday.hoursWorked ?? 8,
    meetings:    existingToday.meetings    ?? 2,
    breaks:      existingToday.breaks      ?? 2,
    overtime:    existingToday.overtime    ?? 0,
    sleepHours:  existingToday.sleepHours  ?? 7,
  });
  const [saved, setSaved] = useState(false);
  const [logs, setLogs]   = useState(() => BDStore.getActivityLogs());

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    const entry = { ...form, date: today() };
    BDStore.saveActivityLog(entry);
    const all = BDStore.getActivityLogs();
    setLogs(all);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    const scored = scoreActivitySignals(all);
    onScoreReady?.(scored);
  };

  const scoredLogs = scoreActivitySignals(logs);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Daily form ── */}
      <div className="p-4" style={{ background: '#fff', border: BLK, boxShadow: '2px 2px 0 #111' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={14} />
            <span className="text-xs font-black font-mono uppercase tracking-wider">Today's Check-In</span>
          </div>
          <span className="text-[9px] font-mono text-black/40">{today()}</span>
        </div>

        <div className="flex flex-col gap-5">

          {/* Mood */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Star size={11} />
              <label className="text-[10px] font-black font-mono uppercase tracking-wider">
                Mood · <span className="font-normal normal-case text-black/50">{MOOD_LABELS[form.mood]}</span>
              </label>
            </div>
            <EmojiPicker value={form.mood} onChange={set('mood')} labels={MOOD_LABELS} />
          </div>

          {/* Focus */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Flame size={11} />
              <label className="text-[10px] font-black font-mono uppercase tracking-wider">
                Focus Quality · <span className="font-normal normal-case text-black/50">{FOCUS_LABELS[form.focus]}</span>
              </label>
            </div>
            <EmojiPicker value={form.focus} onChange={set('focus')} labels={FOCUS_LABELS} />
          </div>

          {/* Number inputs grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              { key: 'hoursWorked', label: 'Hours Worked', icon: <Clock size={10} />, max: 24 },
              { key: 'meetings',    label: 'Meetings',     icon: <Users size={10} />, max: 20 },
              { key: 'breaks',      label: 'Breaks Taken', icon: <Coffee size={10} />, max: 10 },
              { key: 'overtime',    label: 'Overtime (h)',  icon: <Flame size={10} />, max: 12 },
              { key: 'sleepHours',  label: 'Sleep Last Night (h)', icon: <Clock size={10} />, max: 12 },
            ].map(({ key, label, icon, max }) => (
              <div key={key}>
                <div className="flex items-center gap-1 mb-1.5">
                  {icon}
                  <label className="text-[9px] font-black font-mono uppercase tracking-wider text-black/60">{label}</label>
                </div>
                <NumberInput value={form[key]} onChange={set(key)} max={max} />
              </div>
            ))}
          </div>

          {/* Warning banners */}
          {form.hoursWorked > 10 && (
            <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono"
              style={{ background: '#fff7ed', border: '1px solid #f97316', color: '#9a3412' }}>
              ⚠ Working {form.hoursWorked}h today — burnout risk increases above 10h
            </div>
          )}
          {form.meetings > 5 && (
            <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono"
              style={{ background: '#fef2f2', border: '1px solid #dc2626', color: '#991b1b' }}>
              🔴 {form.meetings} meetings — cognitive load from context switching is high
            </div>
          )}
          {form.breaks === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono"
              style={{ background: '#fef9c3', border: '1px solid #eab308', color: '#92400e' }}>
              💛 No breaks logged — micro-breaks every 90 min reduce burnout significantly
            </div>
          )}

          <button onClick={handleSave}
            className="w-full py-2.5 text-[11px] font-black font-mono uppercase tracking-widest transition-all"
            style={{ border: BLK, background: '#111', color: '#fff' }}>
            {saved ? '✓ Saved!' : 'Save Today\'s Log →'}
          </button>
        </div>
      </div>

      {/* ── Activity score panel ── */}
      {logs.length > 0 && (
        <div style={{ border: BLK }}>
          <div className="px-3 py-2" style={{ borderBottom: BLK, background: '#f8f8f8' }}>
            <span className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50">
              Activity Burnout Signal · {logs.length} days logged
            </span>
          </div>
          <div className="px-4 py-3 flex justify-between items-center"
            style={{ background: scoredLogs.score > 60 ? '#fef2f2' : scoredLogs.score > 35 ? '#fff7ed' : '#f0fdf4', borderBottom: BLK }}>
            <div>
              <p className="text-[8px] font-mono text-black/40">Overall Activity Score</p>
              <p className="text-3xl font-black" style={{ fontFamily: 'Georgia, serif' }}>
                {scoredLogs.score}<span className="text-sm">/100</span>
              </p>
            </div>
            <div className="text-[10px] font-mono text-right">
              <p>Avg mood: <strong>{scoredLogs.detail.avgMood?.[0]}</strong>/5</p>
              <p>Avg focus: <strong>{scoredLogs.detail.avgFocus?.[0]}</strong>/5</p>
              <p>Avg hrs: <strong>{scoredLogs.detail.avgHours}</strong>h</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <DayHeatmap logs={logs} />
          </div>
        </div>
      )}
    </div>
  );
}
