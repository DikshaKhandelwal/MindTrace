import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Link2, RefreshCw, Users } from 'lucide-react';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function ShareModal({ members, myState, onClose }) {
  const [code, setCode]         = useState('');
  const [copied, setCopied]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function saveAndSetCode(c) {
    const payload = {
      code: c,
      owner: myState.name || 'A friend',
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        initials: m.initials,
        relation: m.relation,
        avatarHue: m.avatarHue,
        currentMood: m.currentMood,
        trustLevel: m.trustLevel,
        note: m.note,
        supportStyle: m.supportStyle,
      })),
      myState: { mood: myState.mood, note: myState.note, name: myState.name },
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`ic_share_${c}`, JSON.stringify(payload));
    return c;
  }

  useEffect(() => {
    const c = generateCode();
    setCode(saveAndSetCode(c));
  }, []);

  function refresh() {
    setRefreshing(true);
    setTimeout(() => {
      const c = generateCode();
      setCode(saveAndSetCode(c));
      setRefreshing(false);
    }, 400);
  }

  function copyCode() {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(5, 2, 20, 0.75)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="inner-card w-full max-w-md p-8"
        style={{ border: '1px solid rgba(190,150,255,0.18)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs font-black tracking-widest text-violet-400/55 uppercase mb-1.5">Invite to View</div>
            <h3 className="text-3xl font-black text-white/90">Share Your Circle</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/8 transition-all border border-white/8 ml-4 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Description */}
        <p className="text-white/45 text-base leading-relaxed mb-7">
          Share this code with people in your circle so they can view your shared mood network —
          anonymously and read-only.
        </p>

        {/* Code display */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Circle Code</div>
          <div
            className="flex items-center justify-between rounded-2xl px-6 py-5"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1.5px solid rgba(139,92,246,0.25)' }}
          >
            <span
              className="text-4xl font-black tracking-[0.25em] text-white/90 select-all"
              style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.3em' }}
            >
              {code}
            </span>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={refresh}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
                title="Generate new code"
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={copyCode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: copied ? 'rgba(52,211,153,0.2)' : 'rgba(139,92,246,0.30)', border: `1px solid ${copied ? 'rgba(52,211,153,0.35)' : 'rgba(139,92,246,0.40)'}` }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div
          className="rounded-2xl px-5 py-4 mb-6 space-y-2.5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {[
            { n: '1', text: 'Share this code with people in your circle.' },
            { n: '2', text: 'They open Inner Circle → tap "Join a Circle".' },
            { n: '3', text: 'They enter the code and see your shared view.' },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white/70 flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(139,92,246,0.20)' }}
              >
                {n}
              </div>
              <span className="text-white/50 text-sm leading-relaxed">{text}</span>
            </div>
          ))}
        </div>

        {/* Circle preview */}
        {members.length > 0 && (
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.14)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-violet-400/60" />
              <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Visible to them</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {members.map(m => (
                <div
                  key={m.id}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `hsl(${m.avatarHue},45%,28%)` }}
                  title={m.name}
                >
                  {m.initials}
                </div>
              ))}
              <span className="text-white/30 text-sm ml-1">{members.length} {members.length === 1 ? 'person' : 'people'}, read-only</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
