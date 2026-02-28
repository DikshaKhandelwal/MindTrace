import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, UserPlus, Lock } from 'lucide-react';
import { RELATIONS, SUPPORT_STYLES, MOOD_META } from '../data/circle';

const AVATAR_HUES = [263, 335, 172, 210, 30, 145, 0, 190];

export default function AddMember({ onAdd, memberCount, go }) {
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [relation, setRelation] = useState('');
  const [style, setStyle]     = useState('check-ins');
  const [trust, setTrust]     = useState(3);
  const [done, setDone]       = useState(false);

  const MAX_CIRCLE = 5;
  const canAdd = memberCount < MAX_CIRCLE;

  function handleAdd() {
    if (!name.trim() || !relation) return;
    const hue = AVATAR_HUES[Math.floor(Math.random() * AVATAR_HUES.length)];
    onAdd({
      name: name.trim(),
      initials: name.trim().slice(0, 2).toUpperCase(),
      phone: phone.trim(),
      relation,
      trustLevel: trust,
      avatarHue: hue,
      currentMood: 'okay',
      streakDays: 0,
      riskLevel: 'low',
      lastSeen: 'just now',
      lastUpdate: 'just now',
      note: '',
      supportStyle: style,
      responsePattern: 'No patterns yet — you\'ll learn over time.',
      silentUntil: null,
      checkHistory: [],
      insights: [],
    });
    setDone(true);
    setTimeout(() => go('dashboard'), 1200);
  }

  if (!canAdd) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="inner-card p-10 text-center max-w-sm w-full">
          <Lock size={28} className="text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white/80 mb-2">Circle is full</h3>
          <p className="text-white/40 text-sm mb-6">
            Inner Circle allows a maximum of {MAX_CIRCLE} people. This is intentional — meaningful relationships take space.
          </p>
          <button
            onClick={() => go('dashboard')}
            className="w-full py-3 rounded-2xl bg-white/6 text-white/50 text-sm font-medium border border-white/8"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inner-card p-10 text-center max-w-sm w-full"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-emerald-300" />
          </div>
          <h3 className="text-2xl font-bold text-white/90 mb-1">{name} added</h3>
          <p className="text-white/40 text-sm">Welcome to your circle.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-12 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs font-bold tracking-widest text-violet-400/60 uppercase mb-2">Add to Circle</div>
        <h2 className="text-4xl font-extrabold text-white/90 mb-2">Who do you trust?</h2>
        <p className="text-white/35 text-base mb-8">
          {MAX_CIRCLE - memberCount} spot{MAX_CIRCLE - memberCount !== 1 ? 's' : ''} remaining.
          Choose intentionally.
        </p>

        {/* Name */}
        <div className="mb-5">
          <div className="text-xs text-white/35 mb-2">Name</div>
          <input
            className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 text-sm text-white/80 placeholder:text-white/22 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            placeholder="Their first name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
          />
        </div>

        {/* Phone (optional — for WhatsApp) */}
        <div className="mb-5">
          <div className="text-xs text-white/35 mb-1">WhatsApp Number <span className="text-white/20">(optional)</span></div>
          <div className="text-xs text-white/22 mb-2">Include country code, e.g.&nbsp;+1&nbsp;555&nbsp;123&nbsp;4567</div>
          <input
            className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 text-sm text-white/80 placeholder:text-white/22 focus:outline-none focus:ring-2 focus:ring-green-500/30"
            placeholder="+1 555 123 4567"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            maxLength={20}
          />
        </div>

        {/* Relation */}
        <div className="mb-5">
          <div className="text-xs text-white/35 mb-2">Relationship</div>
          <div className="flex flex-wrap gap-2">
            {RELATIONS.map(r => (
              <button
                key={r}
                onClick={() => setRelation(r)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  relation === r
                    ? 'bg-violet-600/25 border-violet-500/40 text-violet-200'
                    : 'bg-white/4 border-white/8 text-white/40 hover:text-white/60'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Trust level */}
        <div className="mb-5">
          <div className="text-xs text-white/35 mb-3">Trust level</div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                onClick={() => setTrust(n)}
                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  n <= trust
                    ? 'bg-violet-600/25 border-violet-500/40 text-violet-200'
                    : 'bg-white/4 border-white/8 text-white/30'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="text-xs text-white/25 mt-1.5 text-center">
            {trust === 5 ? 'You share everything' : trust >= 3 ? 'You share selectively' : 'Surface-level for now'}
          </div>
        </div>

        {/* Support style */}
        <div className="mb-8">
          <div className="text-xs text-white/35 mb-2.5">How do they prefer support?</div>
          <div className="space-y-2">
            {SUPPORT_STYLES.map(s => (
              <button
                key={s.key}
                onClick={() => setStyle(s.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                  style === s.key
                    ? 'bg-violet-600/20 border-violet-500/40 text-white/80'
                    : 'bg-white/3 border-white/7 text-white/40 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs opacity-50 mt-0.5">{s.desc}</div>
                </div>
                {style === s.key && <Check size={14} className="text-violet-300 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim() || !relation}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-violet-600/80 hover:bg-violet-600 text-white font-semibold text-sm transition-all disabled:opacity-30"
          style={{ boxShadow: '0 0 30px rgba(139,92,246,0.2)' }}
        >
          <UserPlus size={16} />
          Add {name.trim() || 'to your Circle'}
        </button>
      </motion.div>
    </div>
  );
}
