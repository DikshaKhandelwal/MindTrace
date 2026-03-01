import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import axios from 'axios';

export default function SpillMachine({ onClose }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [steaming, setSteaming] = useState(false);

  const handleSpill = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setSteaming(true);
    setResponse('');
    try {
      const res = await axios.post('/api/mindcafe/spill', { thoughts: text });
      setResponse(res.data.response);
    } catch {
      setResponse('The machine hums quietly. Whatever you were carrying — it heard it.');
    } finally {
      setLoading(false);
      setTimeout(() => setSteaming(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(28,14,4,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
        style={{
          background: '#fdf6ee',
          border: '1px solid rgba(92,60,30,0.2)',
          boxShadow: '0 8px 48px rgba(44,26,14,0.18)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(92,60,30,0.12)' }}>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(92,60,30,0.55)' }}>
              🌫️ Spill Your Thoughts Machine
            </p>
            <p className="font-serif text-xs italic" style={{ color: 'rgba(92,60,30,0.4)' }}>
              Type it in. Let the steam carry it away.
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(92,60,30,0.45)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Textarea */}
        <div className="px-5 pt-5 pb-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Just start typing. There's no wrong answer here…"
            rows={5}
            className="w-full resize-none font-serif text-sm focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(92,60,30,0.2)',
              color: '#2c1a0e',
              padding: '12px 14px',
              lineHeight: 1.7,
            }}
          />
        </div>

        {/* Steam animation */}
        <AnimatePresence>
          {steaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center gap-4 py-2"
            >
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  style={{
                    width: 3,
                    height: 24,
                    background: 'rgba(92,60,30,0.2)',
                    borderRadius: 8,
                    transformOrigin: 'bottom center',
                  }}
                  animate={{ scaleY: [0, 1.5, 0], y: [0, -20, -40], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-5 mb-4 px-4 py-4"
              style={{
                background: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(92,60,30,0.18)',
              }}
            >
              <p className="font-serif text-sm italic leading-relaxed" style={{ color: '#2c1a0e' }}>
                "{response}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5 pt-1">
          <span className="font-mono text-[10px]" style={{ color: 'rgba(92,60,30,0.4)' }}>
            This stays between you and the machine
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSpill}
            disabled={loading || !text.trim()}
            className="px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-all"
            style={{
              background: text.trim() ? '#2c1a0e' : 'rgba(92,60,30,0.06)',
              border: `1px solid ${text.trim() ? '#2c1a0e' : 'rgba(92,60,30,0.18)'}`,
              color: text.trim() ? '#fef3c7' : 'rgba(92,60,30,0.3)',
            }}
          >
            {loading ? '…' : '🌫️ Release'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
