import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, ArrowRight, AlertCircle } from 'lucide-react';

export default function JoinCircle({ onJoin, go }) {
  const [code, setCode]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) { setError('Enter the full 6-character code.'); return; }
    setLoading(true);
    setError('');

    setTimeout(() => {
      const raw = localStorage.getItem(`ic_share_${trimmed}`);
      if (!raw) {
        setError('Code not found. Double-check with the person who shared it.');
        setLoading(false);
        return;
      }
      try {
        const data = JSON.parse(raw);
        setLoading(false);
        onJoin(data);
      } catch {
        setError('Something went wrong reading that code.');
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="inner-card w-full max-w-md p-8"
        style={{ border: '1px solid rgba(190,150,255,0.18)' }}
      >
        <div className="text-xs font-black tracking-widest text-violet-400/55 uppercase mb-2">Join a Circle</div>
        <h2 className="text-4xl font-black text-white/92 mb-3 leading-tight">Enter the code</h2>
        <p className="text-white/40 text-base leading-relaxed mb-8">
          Someone in your life shared a 6-character code with you.
          Enter it below to view their circle.
        </p>

        {/* Code input */}
        <div className="relative mb-4">
          <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/40" />
          <input
            className="w-full bg-white/5 border rounded-2xl pl-11 pr-4 py-4 text-2xl font-black text-white/90 tracking-[0.25em] placeholder:text-white/18 placeholder:font-normal placeholder:tracking-normal focus:outline-none transition-all uppercase"
            style={{ borderColor: error ? 'rgba(239,68,68,0.35)' : 'rgba(190,150,255,0.20)', letterSpacing: '0.22em' }}
            placeholder="ABC123"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            maxLength={6}
            spellCheck={false}
            autoFocus
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 mb-4 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}
            >
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300/80 text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleJoin}
          disabled={code.length < 6 || loading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-bold text-white transition-all disabled:opacity-35"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.90), rgba(99,38,210,0.90))',
            boxShadow: code.length >= 6 ? '0 0 40px rgba(139,92,246,0.28)' : 'none',
          }}
        >
          {loading ? (
            <span className="animate-pulse">Checking code…</span>
          ) : (
            <>Enter Circle <ArrowRight size={18} /></>
          )}
        </motion.button>

        <button
          onClick={() => go('dashboard')}
          className="w-full mt-3 py-3.5 rounded-2xl text-base font-medium text-white/35 hover:text-white/60 transition-colors"
        >
          Back to my circle
        </button>
      </motion.div>
    </div>
  );
}
