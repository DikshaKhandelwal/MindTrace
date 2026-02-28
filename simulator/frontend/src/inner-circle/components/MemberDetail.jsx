import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle, ChevronDown, ChevronUp, Trash2, Pencil, Check, X, Clock, MessageCircle } from 'lucide-react';
import { MOOD_META, MOODS } from '../data/circle';

export default function MemberDetail({ member, go, onUpdateMood, onDelete, onUpdateNote }) {
  const [showHistory,   setShowHistory]   = useState(false);
  const [updatingMood,  setUpdatingMood]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingNote,   setEditingNote]   = useState(false);
  const [noteVal,       setNoteVal]       = useState(member.note || '');
  const mm = MOOD_META[member.currentMood];

  function openWhatsApp() {
    const digits = (member.phone || '').replace(/[^\d+]/g, '');
    if (!digits) return;
    const isLow = member.currentMood === 'low' || member.currentMood === 'overwhelmed';
    const text = isLow
      ? `Hey ${member.name}, just reaching out to check in on you 💜 Hope you're doing okay.`
      : `Hey ${member.name}! 👋 Just thinking about you — how have you been? 🌟`;
    window.open(`https://wa.me/${digits.replace(/^\+/, '')}?text=${encodeURIComponent(text)}`, '_blank');
  }

  function saveNote() {
    onUpdateNote(member.id, noteVal.trim());
    setEditingNote(false);
  }

  return (
    <div className="min-h-screen px-6 sm:px-10 pt-20 pb-12 max-w-2xl mx-auto">

      {/* ── Delete Confirmation Overlay ─────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(5,2,18,0.80)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="inner-card p-8 max-w-sm w-full text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}
              >
                <Trash2 size={26} className="text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white/90 mb-2">Remove {member.name}?</h3>
              <p className="text-white/40 text-base mb-8 leading-relaxed">
                This will remove them from your circle permanently. You can always add them back.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-3.5 rounded-2xl text-base font-semibold text-white/50 border border-white/10 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(member.id)}
                  className="flex-1 py-3.5 rounded-2xl text-base font-semibold text-white transition-all"
                  style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.35)' }}
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-5 mb-8"
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, hsl(${member.avatarHue},50%,20%), hsl(${member.avatarHue},55%,32%))`,
            boxShadow: `0 0 36px ${mm.color}45`,
          }}
        >
          {member.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-4xl sm:text-5xl font-black text-white/92 leading-none mb-2">{member.name}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/38 text-base">{member.relation}</span>
            <span className="text-white/18">·</span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mm.color, boxShadow: `0 0 8px ${mm.color}` }} />
              <span className="text-base font-semibold" style={{ color: mm.color }}>{mm.label}</span>
              {member.streakDays > 1 && (
                <span className="text-white/28 text-sm">for {member.streakDays} day{member.streakDays > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`text-xs px-3 py-1 rounded-full risk-${member.riskLevel}`}>
            {member.riskLevel} risk
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/8"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </motion.div>

      {/* ── Trust Level ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="inner-card px-6 py-5 mb-4"
      >
        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Trust Level</div>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <div
              key={n}
              className="h-2 flex-1 rounded-full transition-all"
              style={{
                background: n <= member.trustLevel
                  ? `hsl(${member.avatarHue},65%,58%)`
                  : 'rgba(255,255,255,0.07)',
                boxShadow: n <= member.trustLevel ? `0 0 10px hsl(${member.avatarHue},65%,58%)50` : 'none',
              }}
            />
          ))}
        </div>
        <div className="text-white/25 text-sm mt-2">
          {member.trustLevel >= 5 ? 'Deep trust — you share everything'
            : member.trustLevel >= 3 ? 'Selective trust — chosen carefully'
            : 'Surface level — still building'}
        </div>
      </motion.div>

      {/* ── Note ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}
        className="inner-card px-6 py-5 mb-4"
        style={{ borderLeft: '2.5px solid rgba(139,92,246,0.35)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider">Your Note</div>
          {!editingNote ? (
            <button onClick={() => setEditingNote(true)} className="flex items-center gap-1.5 text-xs text-violet-400/60 hover:text-violet-300 transition-colors">
              <Pencil size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveNote} className="flex items-center gap-1 text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors">
                <Check size={12} /> Save
              </button>
              <button onClick={() => { setNoteVal(member.note || ''); setEditingNote(false); }} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                <X size={12} /> Cancel
              </button>
            </div>
          )}
        </div>
        {editingNote ? (
          <textarea
            className="w-full text-base text-white/70 leading-relaxed bg-white/5 rounded-xl px-3 py-2.5 border border-violet-500/20 focus:outline-none focus:border-violet-400/40 resize-none"
            rows={3}
            value={noteVal}
            onChange={e => setNoteVal(e.target.value)}
            placeholder="Write a note about this person..."
            maxLength={300}
            autoFocus
          />
        ) : (
          <p
            className="text-base text-white/58 leading-relaxed italic cursor-text"
            onClick={() => setEditingNote(true)}
          >
            {member.note || <span className="text-white/22 not-italic">No note yet — tap Edit to add one.</span>}
          </p>
        )}
      </motion.div>

      {/* ── Support Style + Pattern ───────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
        className="inner-card px-6 py-5 mb-4 grid grid-cols-2 gap-5"
      >
        <div>
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1.5">Support Style</div>
          <div className="text-base text-white/72 font-medium capitalize">{member.supportStyle.replace(/-/g, ' ')}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1.5">Response Pattern</div>
          <div className="text-base text-white/58 leading-snug">{member.responsePattern}</div>
        </div>
      </motion.div>

      {/* ── Behavior Insights ────────────────────────── */}
      {member.insights?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
          className="inner-card px-6 py-5 mb-4"
        >
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Behavior Insights</div>
          <div className="space-y-3">
            {member.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(139,92,246,0.7)' }} />
                <p className="text-base text-white/55 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Last Contact Warning ─────────────────────── */}
      {member.lastSeen && (member.lastSeen.includes('d ago') || member.lastSeen.includes('week')) && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}
          className="rounded-2xl px-5 py-3.5 mb-4 flex items-center gap-3"
          style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.15)' }}
        >
          <Clock size={16} className="text-orange-400/70 flex-shrink-0" />
          <span className="text-orange-300/75 text-base">Last contact&nbsp;{member.lastSeen}. It might be a good time to reach out.</span>
        </motion.div>
      )}

      {/* ── Check-in History ─────────────────────────── */}
      {member.checkHistory?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          className="inner-card px-6 py-5 mb-6"
        >
          <button
            onClick={() => setShowHistory(v => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider">
              Recent Interactions ({member.checkHistory.length})
            </div>
            {showHistory
              ? <ChevronUp size={16} className="text-white/25" />
              : <ChevronDown size={16} className="text-white/25" />
            }
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4 border-t border-white/6 pt-4">
                  {member.checkHistory.map((h, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-px bg-white/8 ml-2.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-white/25 mb-1">
                          {h.date} · {h.you ? 'You reached out' : `${member.name} reached out`}
                        </div>
                        <div className="text-base text-white/58">"{h.message}"</div>
                        {h.reply && (
                          <div className="text-sm text-white/30 mt-0.5">↩ "{h.reply}"</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Update Mood Expander ──────────────────────── */}
      <AnimatePresence>
        {updatingMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="inner-card px-6 py-5 mb-4"
          >
            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
              Update mood based on what they shared
            </div>
            <div className="flex flex-wrap gap-2.5">
              {MOODS.map(k => {
                const m = MOOD_META[k];
                const isSelected = member.currentMood === k;
                return (
                  <button
                    key={k}
                    onClick={() => { onUpdateMood(member.id, k); setUpdatingMood(false); }}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all"
                    style={{
                      background: isSelected ? `${m.color}18` : 'rgba(255,255,255,0.04)',
                      borderColor: isSelected ? `${m.color}50` : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                    <span className="text-base text-white/65 font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Actions ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col gap-3"
      >
        <div className="flex gap-3">
          <button
            onClick={() => go('compose', { composeFor: member.id })}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white text-lg font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(99,38,210,0.85))',
              boxShadow: '0 0 36px rgba(139,92,246,0.28)',
            }}
          >
            <Send size={18} />
            Reach Out
          </button>
          <button
            onClick={() => setUpdatingMood(v => !v)}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white/58 text-lg font-semibold border border-white/10 hover:bg-white/5 transition-all"
          >
            <AlertCircle size={18} />
            Update Mood
          </button>
        </div>

        {/* WhatsApp button */}
        {member.phone ? (
          <button
            onClick={openWhatsApp}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white text-lg font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(37,211,102,0.22), rgba(18,140,60,0.22))',
              border: '1px solid rgba(37,211,102,0.30)',
              boxShadow: '0 0 28px rgba(37,211,102,0.12)',
            }}
          >
            {/* WhatsApp SVG logo */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Message on WhatsApp
          </button>
        ) : (
          <div
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white/22 text-base border border-white/6"
          >
            <MessageCircle size={16} />
            <span>Add a phone number to enable WhatsApp</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
