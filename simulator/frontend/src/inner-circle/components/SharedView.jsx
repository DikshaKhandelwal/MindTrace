import { motion } from 'framer-motion';
import { Lock, Eye, Heart } from 'lucide-react';
import { MOOD_META } from '../data/circle';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const pop    = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

function MoodRing({ member }) {
  const mm = MOOD_META[member.currentMood];
  return (
    <motion.div
      variants={pop}
      className="inner-card p-5 flex items-start gap-4"
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, hsl(${member.avatarHue},50%,20%), hsl(${member.avatarHue},55%,32%))`,
          boxShadow: `0 0 24px ${mm.color}40`,
        }}
      >
        {member.initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xl font-bold text-white/90">{member.name}</span>
          <span className="text-white/28 text-sm">·</span>
          <span className="text-white/38 text-sm">{member.relation}</span>
        </div>

        {/* Mood */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: mm.color, boxShadow: `0 0 8px ${mm.color}` }}
          />
          <span className="text-base font-semibold" style={{ color: mm.color }}>{mm.label}</span>
        </div>

        {/* Trust bar */}
        <div className="flex gap-1.5 mb-2">
          {[1,2,3,4,5].map(n => (
            <div
              key={n}
              className="h-1 flex-1 rounded-full"
              style={{
                background: n <= member.trustLevel
                  ? `hsl(${member.avatarHue},60%,52%)`
                  : 'rgba(255,255,255,0.06)',
              }}
            />
          ))}
        </div>

        {/* Support style */}
        <div className="text-white/32 text-sm capitalize">{member.supportStyle?.replace(/-/g, ' ')}</div>
      </div>
    </motion.div>
  );
}

export default function SharedView({ circleData, go }) {
  const { owner, members, myState, createdAt } = circleData;
  const ownerMood = MOOD_META[myState?.mood || 'okay'];
  const created = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="min-h-screen pt-20 px-6 sm:px-10 pb-12 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

        {/* Type badge */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' }}
          >
            <Eye size={12} />
            Shared View · Read-Only
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.28)' }}
          >
            <Lock size={10} />
            Secure
          </div>
        </div>

        {/* Header */}
        <h1 className="text-5xl sm:text-6xl font-black text-white/92 mb-2 leading-none">
          {owner}'s Circle
        </h1>
        <p className="text-white/35 text-lg mb-2">
          {members.length} {members.length === 1 ? 'person' : 'people'} · shared {created}
        </p>

        {/* Owner state */}
        {myState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inner-card px-6 py-4 mt-6 mb-8 flex items-center gap-4"
          >
            <div
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: ownerMood.color, boxShadow: `0 0 12px ${ownerMood.color}` }}
            />
            <div>
              <div className="text-white/35 text-sm">{owner} is currently feeling</div>
              <div className="text-xl font-bold" style={{ color: ownerMood.color }}>{ownerMood.label}</div>
              {myState.note && (
                <div className="text-white/30 text-sm mt-0.5 italic">"{myState.note}"</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Members */}
        <div className="text-xs font-black tracking-widest text-white/28 uppercase mb-4">
          Their Circle
        </div>

        {members.length === 0 ? (
          <div className="inner-card p-8 text-center">
            <div className="text-white/25 text-base">No members visible yet.</div>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3 mb-8">
            {members.map(m => (
              <MoodRing key={m.id} member={m} />
            ))}
          </motion.div>
        )}

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl px-5 py-4 flex items-start gap-3"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
        >
          <Heart size={15} className="text-violet-400/60 mt-0.5 flex-shrink-0" />
          <p className="text-white/40 text-sm leading-relaxed">
            This is a read-only view of {owner}'s Inner Circle. Mood data is shared with your consent — you're seeing this because they trusted you with the code.
          </p>
        </motion.div>

        {/* Back */}
        <button
          onClick={() => go('dashboard')}
          className="mt-6 w-full py-4 rounded-2xl text-base font-semibold text-white/40 hover:text-white/70 border border-white/8 hover:bg-white/5 transition-all"
        >
          Back to my circle
        </button>

      </motion.div>
    </div>
  );
}
