import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Square, ChevronUp, ChevronDown } from 'lucide-react';
import EmotionPulse from '../EmotionPulse';

export default function ImmersiveHUD({
  persona,
  currentEmotion,
  subtitle,
  isTalking,
  isListening,
  onToggleVoice,
  voiceSupported,
  input,
  setInput,
  onSend,
  sending,
  evaluating,
  onEndSession,
  exchangeCount,
  roomType,
}) {
  const [showInput, setShowInput] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const handleSend = () => { onSend(); setShowInput(false); };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col">
      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="pointer-events-auto flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/30 to-transparent">
        {/* Persona + room */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl border border-white/30">
            {persona.avatar}
          </div>
          <div>
            <p className="font-semibold text-white text-sm drop-shadow">{persona.name}</p>
            <p className="text-white/70 text-xs capitalize">{roomType?.replace('_', ' ')} · {persona.relationship}</p>
          </div>
        </div>

        {/* End button + exchange count */}
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs">
            {exchangeCount} {exchangeCount === 1 ? 'exchange' : 'exchanges'}
          </span>
          <button
            onClick={onEndSession}
            disabled={evaluating || exchangeCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
              text-white bg-white/20 backdrop-blur border border-white/30
              hover:bg-white/30 active:scale-95 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {evaluating ? (
              <><span className="animate-spin">⟳</span> Analysing…</>
            ) : (
              <><Square size={12} fill="white" /> End</>
            )}
          </button>
        </div>
      </div>

      {/* ── Emotion badge (floats centre-top) ──────────── */}
      <div className="flex-1 flex flex-col items-center justify-start pt-3 px-4">
        <AnimatePresence mode="wait">
          {currentEmotion?.emotion && (
            <motion.div
              key={currentEmotion.emotion}
              initial={{ opacity: 0, y: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-none mb-2"
            >
              <EmotionPulse emotion={currentEmotion.emotion} intensity={currentEmotion.intensity} compact />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking dots while AI is generating */}
        <AnimatePresence>
          {sending && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-1.5 bg-black/30 backdrop-blur px-4 py-2.5 rounded-2xl border border-white/20"
            >
              {[0,1,2].map(i => (
                <motion.span
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/80"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Subtitle / caption area ─────────────────────── */}
      <div className="flex justify-center px-4 mb-3">
        <AnimatePresence mode="wait">
          {subtitle && (
            <motion.div
              key={subtitle.slice(0, 20)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl bg-black/50 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/15"
            >
              <p className="text-white text-sm leading-relaxed text-center drop-shadow">
                <span className="text-white/50 text-xs font-medium mr-2">{persona.name}</span>
                {subtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Listening waveform ──────────────────────────── */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex justify-center mb-2"
          >
            <div className="pointer-events-auto flex items-center gap-3 bg-red-900/60 backdrop-blur px-5 py-2.5 rounded-2xl border border-red-400/30">
              <div className="flex items-end gap-0.5 h-5">
                {[0.4,0.9,0.6,1.0,0.7,0.85,0.5,0.95,0.65].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-red-400"
                    animate={{ scaleY: [h, 1, h * 0.4, h] }}
                    transition={{ duration: 0.5, delay: i * 0.07, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ height: '100%', originY: 1 }}
                  />
                ))}
              </div>
              <span className="text-red-300 text-xs font-semibold">Listening — speak now</span>
              <button
                onClick={onToggleVoice}
                className="text-red-300 hover:text-red-100 transition-colors"
              >
                <MicOff size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input entered text preview ──────────────────── */}
      <AnimatePresence>
        {input && showInput && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-center mb-2 px-4"
          >
            <div className="pointer-events-auto max-w-xl w-full bg-white/15 backdrop-blur rounded-2xl px-4 py-3 border border-white/25">
              <p className="text-white text-sm leading-relaxed">
                <span className="text-white/50 text-xs font-medium mr-2">You</span>
                {input}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom control bar ──────────────────────────── */}
      <div className="pointer-events-auto px-5 pb-6 bg-gradient-to-t from-black/35 to-transparent pt-4">

        {/* Text input panel (expandable) */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Say something to ${persona.name}…`}
                  rows={2}
                  disabled={sending || evaluating}
                  autoFocus
                  className="flex-1 bg-black/50 backdrop-blur border border-white/25 rounded-2xl px-4 py-3
                    text-sm text-white placeholder-white/40 outline-none focus:border-lavender-400/50 resize-none leading-relaxed"
                  style={{ maxHeight: '100px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
                    bg-gradient-to-br from-lavender-500 to-purple-600 text-white shadow-glow
                    hover:scale-105 active:scale-95 transition-all duration-200
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={17} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main action row */}
        <div className="flex items-center justify-center gap-3">

          {/* Type toggle */}
          <button
            onClick={() => setShowInput(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium
              text-white/80 bg-white/15 backdrop-blur border border-white/25
              hover:bg-white/25 active:scale-95 transition-all duration-200"
          >
            {showInput ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            Type
          </button>

          {/* Voice button — primary CTA */}
          {voiceSupported && (
            <motion.button
              onClick={onToggleVoice}
              disabled={sending || evaluating}
              whileTap={{ scale: 0.92 }}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed
                ${isListening
                  ? 'bg-red-500 text-white shadow-[0_0_28px_rgba(239,68,68,0.5)] scale-105'
                  : 'bg-white/90 text-gray-800 shadow-soft hover:bg-white hover:scale-105'
                }`}
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
              {isListening ? 'Stop' : 'Speak'}
            </motion.button>
          )}

          {/* Send if there's typed input and panel is hidden */}
          {input.trim() && !showInput && (
            <motion.button
              onClick={handleSend}
              disabled={sending}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold
                text-white bg-lavender-600/80 backdrop-blur border border-lavender-400/30
                hover:bg-lavender-600 active:scale-95 transition-all"
            >
              <Send size={15} /> Send
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
