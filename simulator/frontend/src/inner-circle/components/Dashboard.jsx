import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BarChart2, Clock, Send, UserPlus, AlertTriangle, Share2 } from 'lucide-react';
import { MOOD_META, getSmartNudges } from '../data/circle';
import NetworkGraph from './NetworkGraph';
import ShareModal from './ShareModal';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const pop = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.42 } } };

/* ─── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState({ go }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 text-center px-4"
    >
      <h2 className="text-4xl sm:text-5xl font-black text-white/85 mb-4 leading-tight">
        Start with one person<br />you truly trust.
      </h2>
      <p className="text-white/38 text-xl max-w-md mb-10 leading-relaxed">
        Inner Circle holds at most&nbsp;5&nbsp;people.
        Space intentionally kept small — for the ones who matter most.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => go('add')}
        className="flex items-center gap-3 px-10 py-5 rounded-2xl text-white text-xl font-bold transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(99,38,210,0.9))',
          boxShadow: '0 0 50px rgba(139,92,246,0.35), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <UserPlus size={22} />
        Add Your First Person
      </motion.button>
    </motion.div>
  );
}

/* ─── Member Card ────────────────────────────────────────────────────────── */
function MemberCard({ member, go, index }) {
  const mm = MOOD_META[member.currentMood];
  const isAtRisk = member.currentMood === 'low' || member.currentMood === 'overwhelmed';
  return (
    <motion.button
      variants={pop}
      custom={index}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => go('member', { memberId: member.id })}
      className="inner-card inner-card-hover p-5 flex flex-col items-center text-center relative overflow-hidden group cursor-pointer"
    >
      {isAtRisk && member.streakDays > 1 && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(251,146,60,0.15)', color: '#fdba74', border: '1px solid rgba(251,146,60,0.25)' }}
        >
          <AlertTriangle size={10} />
          {member.streakDays}d
        </div>
      )}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-4 transition-all"
        style={{
          background: `linear-gradient(135deg, hsl(${member.avatarHue},50%,22%), hsl(${member.avatarHue},55%,32%))`,
          boxShadow: `0 0 28px ${mm.color}40`,
        }}
      >
        {member.initials}
      </div>
      <div className="text-xl font-bold text-white/90 mb-0.5">{member.name}</div>
      <div className="text-sm text-white/35 mb-4">{member.relation}</div>
      <div className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: mm.color, boxShadow: `0 0 8px ${mm.color}` }}
        />
        <span className="text-sm font-medium" style={{ color: mm.color }}>{mm.label}</span>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-b-3xl"
        style={{ background: 'linear-gradient(transparent, rgba(124,58,237,0.28))' }}
      >
        <span className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
          <Send size={11} /> Reach out
        </span>
      </div>
    </motion.button>
  );
}

/* ─── Add Card ───────────────────────────────────────────────────────────── */
function AddCard({ go }) {
  return (
    <motion.button
      variants={pop}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => go('add')}
      className="flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all"
      style={{
        background: 'rgba(139,92,246,0.05)',
        border: '1.5px dashed rgba(139,92,246,0.25)',
        borderRadius: '1.5rem',
        minHeight: '180px',
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'rgba(139,92,246,0.10)', border: '1.5px dashed rgba(139,92,246,0.3)' }}
      >
        <Plus size={24} className="text-violet-400/60" />
      </div>
      <div className="text-white/35 text-base font-medium">Add someone</div>
    </motion.button>
  );
}

/* ─── Nudge Banner ───────────────────────────────────────────────────────── */
function NudgeBanner({ nudges, members, go }) {
  const top = nudges[0];
  const m = members.find(x => x.id === top.memberId);
  if (!m) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full rounded-2xl px-6 py-4 mb-8 flex items-center justify-between gap-4 flex-wrap"
      style={{
        background: top.priority === 'high' ? 'rgba(244,114,182,0.08)' : 'rgba(251,191,36,0.07)',
        border: `1px solid ${top.priority === 'high' ? 'rgba(244,114,182,0.2)' : 'rgba(251,191,36,0.16)'}`,
      }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, hsl(${m.avatarHue},50%,22%), hsl(${m.avatarHue},55%,32%))` }}
        >
          {m.initials}
        </div>
        <div className="min-w-0">
          <div className="text-white/70 text-base font-semibold">{top.message}</div>
          {nudges.length > 1 && (
            <div className="text-white/30 text-sm mt-0.5">+{nudges.length - 1} more</div>
          )}
        </div>
      </div>
      <button
        onClick={() => go('compose', { composeFor: m.id })}
        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
        style={{ background: 'rgba(139,92,246,0.30)', border: '1px solid rgba(139,92,246,0.40)' }}
      >
        <Send size={14} /> Reach out
      </button>
    </motion.div>
  );
}

/* ─── Dashboard Main ─────────────────────────────────────────────────────── */

export default function Dashboard({ members, myState, go }) {
  const [showShare, setShowShare] = useState(false);
  const nudges = getSmartNudges(members);
  const mood = MOOD_META[myState.mood];
  const isEmpty = members.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Share modal overlay */}
      {showShare && (
        <ShareModal members={members} myState={myState} onClose={() => setShowShare(false)} />
      )}
      <div className="pt-20 px-6 sm:px-10 lg:px-16 pb-12 max-w-6xl mx-auto w-full flex-1 flex flex-col">

        {/* ── Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-xs font-black tracking-widest text-violet-400/50 uppercase mb-3">Inner Circle</div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-6xl sm:text-7xl font-black text-white/95 leading-none">
              Your&nbsp;People
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-white/30 text-lg pb-1">
                {isEmpty
                  ? 'No one added yet'
                  : `${members.length} of 5${nudges.length > 0 ? ` · ${nudges.length} need${nudges.length === 1 ? 's' : ''} attention` : ''}`
                }
              </div>
              {!isEmpty && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-violet-300/75 hover:text-violet-200 transition-all pb-1"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
                >
                  <Share2 size={15} />
                  Share
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── My State Banner ────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12 }}
          whileHover={{ scale: 1.005 }}
          onClick={() => go('state')}
          className="inner-card inner-card-hover w-full text-left px-7 py-5 mb-8 flex items-center gap-5"
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: mood.color, boxShadow: `0 0 14px ${mood.color}` }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-white/38 text-sm mb-0.5">You are feeling</div>
            <div className="text-2xl font-bold" style={{ color: mood.color }}>{mood.label}</div>
            {myState.note && (
              <div className="text-white/30 text-sm truncate mt-0.5">{myState.note}</div>
            )}
          </div>
          <div className="text-white/22 text-base flex-shrink-0">Update →</div>
        </motion.button>

        {isEmpty ? (
          <EmptyState go={go} />
        ) : (
          <>
            {/* ── Nudge Banner ───────────────────────────── */}
            {nudges.length > 0 && (
              <NudgeBanner nudges={nudges} members={members} go={go} />
            )}

            {/* ── Network Graph ──────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inner-card p-6 mb-8 flex flex-col items-center relative overflow-hidden"
            >
              <div className="text-xs font-bold tracking-widest text-white/25 uppercase mb-4">
                Mood Network
              </div>
              <NetworkGraph
                members={members}
                myState={myState}
                onSelectMember={id => go('member', { memberId: id })}
              />
              <div className="flex gap-5 flex-wrap justify-center mt-4">
                {['great', 'okay', 'low', 'overwhelmed', 'silent'].map(k => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MOOD_META[k].color }} />
                    <span className="text-white/28 text-xs">{MOOD_META[k].label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Member Card Grid ───────────────────────── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className={`grid gap-4 mb-8 ${
                members.length === 1 ? 'grid-cols-2' :
                members.length === 2 ? 'grid-cols-3' :
                members.length <= 4 ? 'grid-cols-3 sm:grid-cols-4' :
                'grid-cols-3 sm:grid-cols-5'
              }`}
            >
              {members.map((m, i) => (
                <MemberCard key={m.id} member={m} go={go} index={i} />
              ))}
              {members.length < 5 && <AddCard go={go} />}
            </motion.div>
          </>
        )}

        {/* ── Quick Actions Strip ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-3 gap-3 mt-auto"
        >
          {[
            { label: 'Insights', Icon: BarChart2, action: () => go('insights') },
            { label: 'History',  Icon: Clock,     action: () => go('history') },
            { label: isEmpty ? 'Add Someone' : 'Add Person', Icon: Plus, action: () => go('add') },
          ].map(({ label, Icon, action }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={action}
              className="inner-card inner-card-hover flex items-center justify-center gap-3 py-5 text-white/45 hover:text-white/80 transition-colors"
            >
              <Icon size={20} />
              <span className="text-base font-semibold">{label}</span>
            </motion.button>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
