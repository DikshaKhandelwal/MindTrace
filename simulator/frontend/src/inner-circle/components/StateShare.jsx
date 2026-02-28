import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Check } from 'lucide-react';
import { MOOD_META, MOODS, SUPPORT_STYLES } from '../data/circle';

export default function StateShare({ myState, onUpdate, go }) {
  const [mood, setMood]           = useState(myState.mood);
  const [note, setNote]           = useState(myState.note);
  const [silence, setSilence]     = useState(myState.silenceMode);
  const [style, setStyle]         = useState(myState.supportStyle);
  const [saved, setSaved]         = useState(false);

  function handleSave() {
    onUpdate({ ...myState, mood, note, silenceMode: silence, supportStyle: style });
    setSaved(true);
    setTimeout(() => go('dashboard'), 1200);
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-12 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs font-bold tracking-widest text-violet-400/60 uppercase mb-2">My State</div>
        <h2 className="text-4xl font-extrabold text-white/90 mb-2">How are you?</h2>
        <p className="text-white/35 text-base mb-8">Your circle sees this. It fades automatically after 24 hours.</p>

        {/* Mood selector */}
        <div className="mb-8">
          <div className="text-xs text-white/35 mb-3">Right now, I am feeling</div>
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map(k => {
              const m = MOOD_META[k];
              return (
                <motion.button
                  key={k}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setMood(k)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${
                    mood === k
                      ? 'border-transparent bg-white/8'
                      : 'border-white/6 bg-white/3 hover:bg-white/5'
                  }`}
                  style={mood === k ? { boxShadow: `0 0 20px ${m.color}35` } : {}}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: m.color,
                      boxShadow: mood === k ? `0 0 12px ${m.color}80` : 'none',
                    }}
                  />
                  <span className={`text-xs font-medium ${mood === k ? m.text : 'text-white/35'}`}>
                    {m.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Optional note */}
        <div className="mb-6">
          <div className="text-xs text-white/35 mb-2.5">Add a note (optional)</div>
          <textarea
            className="w-full bg-white/4 border border-white/8 rounded-2xl p-4 text-sm text-white/70 placeholder:text-white/22 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none min-h-[80px]"
            placeholder="What's on your mind? This is private unless you choose to share..."
            value={note}
            maxLength={200}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {/* Support style */}
        <div className="mb-6">
          <div className="text-xs text-white/35 mb-2.5">I prefer support as</div>
          <div className="space-y-2">
            {SUPPORT_STYLES.map(s => (
              <button
                key={s.key}
                onClick={() => setStyle(s.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                  style === s.key
                    ? 'bg-violet-600/20 border-violet-500/40 text-white/80'
                    : 'bg-white/3 border-white/7 text-white/40 hover:bg-white/6'
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{s.desc}</div>
                </div>
                {style === s.key && <Check size={14} className="text-violet-300 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Safe silence mode */}
        <div className="inner-card p-5 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Moon size={18} className="text-violet-300/60 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-white/70 text-sm">Safe Silence Mode</div>
                <div className="text-white/35 text-xs mt-0.5">
                  Lets your circle know you need space today. Check-in nudges are paused.
                </div>
              </div>
            </div>
            <button
              onClick={() => setSilence(v => !v)}
              className={`flex-shrink-0 w-12 h-6 rounded-full transition-all relative ${
                silence ? 'bg-violet-500' : 'bg-white/10'
              }`}
            >
              <motion.div
                animate={{ left: silence ? '1.5rem' : '0.25rem' }}
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                style={{ left: silence ? '1.5rem' : '0.25rem' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            saved
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
              : 'bg-violet-600/80 hover:bg-violet-600 text-white'
          }`}
          style={!saved ? { boxShadow: '0 0 30px rgba(139,92,246,0.2)' } : {}}
        >
          {saved ? <><Check size={16} /> Saved</> : 'Update My State'}
        </button>
      </motion.div>
    </div>
  );
}
