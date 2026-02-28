import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SunMedium, Sparkles, Zap, CloudRain, Minus, Cloud, Heart, Loader2 } from 'lucide-react';

const MOODS = [
  { key: 'peaceful',      label: 'Peaceful',      Icon: SunMedium,  bg: 'bg-teal-100',   text: 'text-teal-700',   ring: 'ring-teal-400'   },
  { key: 'hopeful',       label: 'Hopeful',       Icon: Sparkles,   bg: 'bg-amber-100',  text: 'text-amber-700',  ring: 'ring-amber-400'  },
  { key: 'anxious',       label: 'Anxious',       Icon: Zap,        bg: 'bg-blue-100',   text: 'text-blue-700',   ring: 'ring-blue-400'   },
  { key: 'heavy',         label: 'Heavy',         Icon: CloudRain,  bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-400' },
  { key: 'disconnected',  label: 'Disconnected',  Icon: Minus,      bg: 'bg-stone-100',  text: 'text-stone-600',  ring: 'ring-stone-400'  },
  { key: 'overwhelmed',   label: 'Overwhelmed',   Icon: Cloud,      bg: 'bg-rose-100',   text: 'text-rose-700',   ring: 'ring-rose-400'   },
  { key: 'grateful',      label: 'Grateful',      Icon: Heart,      bg: 'bg-pink-100',   text: 'text-pink-700',   ring: 'ring-pink-400'   },
];

// Fallback community distribution (percent)
const COMMUNITY_FALLBACK = {
  peaceful:     18,
  hopeful:      22,
  anxious:      20,
  heavy:        14,
  disconnected: 10,
  overwhelmed:  11,
  grateful:     14,
};

const MESSAGES = {
  peaceful:     "You're not alone in this calm. Others are finding moments of peace today too.",
  hopeful:      "Hope is a quiet strength. Others are holding it alongside you.",
  anxious:      "Many people here know this feeling well. You're in good company.",
  heavy:        "Heaviness is real — and so are the people here carrying their own weight with you.",
  disconnected: "Disconnection is one of the hardest feelings. You reached out, and that matters.",
  overwhelmed:  "Overwhelm passes, even when it doesn't feel like it will. You're not alone.",
  grateful:     "Gratitude is contagious. You just made someone else's day a little warmer.",
};

export default function DailyCheckIn() {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [state, setState] = useState('form'); // form | result
  const [stats, setStats] = useState(COMMUNITY_FALLBACK);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!selectedMood) return;
    setLoading(true);
    try {
      const { data } = await axios.post('/api/community/checkin', { mood: selectedMood, note });
      setStats(data.communityMood || COMMUNITY_FALLBACK);
      setMessage(data.message || MESSAGES[selectedMood]);
    } catch {
      setStats(COMMUNITY_FALLBACK);
      setMessage(MESSAGES[selectedMood]);
    } finally {
      setLoading(false);
      setState('result');
    }
  }

  const moodMeta = MOODS.find(m => m.key === selectedMood);
  const total = Object.values(stats).reduce((s, v) => s + v, 0) || 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-1">Daily Check-In</h2>
      <p className="text-stone-500 text-sm mb-7">How are you doing right now? Your mood is anonymous and only used to show community trends.</p>

      <AnimatePresence mode="wait">
        {state === 'form' ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-6 mb-4">
              <div className="text-sm font-medium text-stone-600 mb-4">Pick the closest to how you feel</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                {MOODS.map(({ key, label, Icon, bg, text, ring }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMood(key)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                      selectedMood === key
                        ? `${bg} ${text} border-transparent ring-2 ${ring} ring-offset-1`
                        : 'bg-white/50 text-stone-500 border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>

              <textarea
                className="w-full min-h-[80px] bg-white/70 border border-stone-200 rounded-xl p-3 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none mb-4"
                placeholder="Add a note (optional) — anonymous"
                value={note}
                maxLength={200}
                onChange={e => setNote(e.target.value)}
              />

              <button
                onClick={handleSubmit}
                disabled={!selectedMood || loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Checking in...</> : 'Check In'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Confirmed mood */}
            {moodMeta && (
              <div className={`glass-card p-5 mb-5 flex items-center gap-3 ${moodMeta.bg}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${moodMeta.bg} border-2 border-white`}>
                  <moodMeta.Icon size={20} className={moodMeta.text} />
                </div>
                <div>
                  <div className={`font-semibold text-sm ${moodMeta.text}`}>Checked in as: {moodMeta.label}</div>
                  <div className="text-xs text-stone-500 mt-0.5 italic">{message}</div>
                </div>
              </div>
            )}

            {/* Community bar chart */}
            <div className="glass-card p-5">
              <div className="text-sm font-semibold text-stone-700 mb-4">Community mood today</div>
              <div className="space-y-2.5">
                {MOODS.map(({ key, label, text }) => {
                  const pct = Math.round((stats[key] / total) * 100);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-stone-500 text-right flex-shrink-0">{label}</div>
                      <div className="flex-1 bg-stone-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className={`h-full rounded-full ${text.replace('text-', 'bg-').replace('-700', '-400').replace('-600', '-400')}`}
                        />
                      </div>
                      <div className="w-8 text-xs text-stone-400 flex-shrink-0">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => { setState('form'); setSelectedMood(''); setNote(''); }}
              className="mt-4 text-sm text-stone-400 hover:text-amber-700 transition-colors mx-auto block"
            >
              Check in again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
