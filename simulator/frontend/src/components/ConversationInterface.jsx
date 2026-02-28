import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, ChevronDown, Info, Mic, MicOff, BarChart2 } from 'lucide-react';
import axios from 'axios';
import EmotionPulse from './EmotionPulse';

const bubbleVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function ConversationInterface({ scenarioData, history, setHistory, onFeedbackReady }) {
  const { scenario, persona, openingMessage } = scenarioData;

  const [messages, setMessages] = useState(() => {
    if (history.length > 0) return rebuildDisplay(history, persona, openingMessage);
    // First load: seed with AI opening
    return [{ role: 'ai', content: openingMessage, emotion: persona.currentMood?.toLowerCase() || 'calm', intensity: 0.5, subtext: '' }];
  });

  const [currentEmotion, setCurrentEmotion] = useState({
    emotion: persona.currentMood?.toLowerCase().split(' ')[0] || 'calm',
    intensity: 0.4,
    subtext: persona.backstory,
  });

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [tipVisible, setTipVisible] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(
    () => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const aiMsgCount = useRef(0);
  const recognitionRef = useRef(null);

  // Keep internal history in sync with parent when replaying
  const internalHistory = useRef([]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function scrollToBottom() {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    setTipVisible(false);

    // Add user message to UI immediately
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    // Build raw history for API
    const newHistory = [...internalHistory.current, { role: 'user', content: text }];

    try {
      const res = await axios.post('/api/simulator/chat', {
        persona,
        scenario,
        history: newHistory,
        userMessage: text,
      });

      const { message, emotion, intensity, subtext } = res.data;

      // Add AI response to UI
      const aiMsg = { role: 'ai', content: message, emotion, intensity, subtext };
      setMessages(prev => [...prev, aiMsg]);

      // Update emotion panel
      setCurrentEmotion({ emotion, intensity, subtext });

      // Persist to internal history (raw format for API)
      internalHistory.current = [
        ...newHistory,
        { role: 'assistant', content: message },
      ];

      aiMsgCount.current += 1;
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Connection error. Please try again.',
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleEndSession = async () => {
    if (internalHistory.current.length < 2) {
      setShowEndConfirm(false);
      return;
    }
    setShowEndConfirm(false);
    setEvaluating(true);

    // Sync parent history
    setHistory(internalHistory.current);

    try {
      const res = await axios.post('/api/simulator/evaluate', {
        persona,
        scenario,
        history: internalHistory.current,
      });
      onFeedbackReady(res.data);
    } catch (err) {
      console.error(err);
      setEvaluating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);
      // auto-resize textarea
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // small delay so user sees the final transcript before focus
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const userTurnCount = internalHistory.current.filter(m => m.role === 'user').length;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Fixed background — room ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-50/85 via-white/80 to-mint-50/85" />
        {/* Soft room-light glow from top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 rounded-full bg-amber-100/30 blur-3xl" />
        {/* Side ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-sage-300/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-mint-300/12 blur-3xl" />
        {/* Floor shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/[0.04] to-transparent" />
      </div>

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 glass-card-strong rounded-none border-0 border-b border-white/60 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-200 to-mint-200 flex items-center justify-center text-sm font-bold text-sage-700 shadow-soft">
            {persona.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">{persona.name}</p>
            <p className="text-xs text-gray-400">{persona.relationship} · {scenario.setting}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live session · {userTurnCount} {userTurnCount === 1 ? 'exchange' : 'exchanges'}
          </div>

          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={evaluating || userTurnCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
              text-white bg-gradient-to-r from-sage-500 to-forest-500 shadow-soft
              hover:shadow-soft-lg hover:scale-105 active:scale-100 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {evaluating ? (
              <><span className="animate-spin inline-block">⟳</span> Analysing…</>
            ) : (
              <><Square size={13} fill="white" /> End & Review</>
            )}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Persona sidebar */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 p-4 gap-4 overflow-y-auto border-r border-white/40">
          {/* Persona mini card */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Character</p>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sage-200 to-mint-200 flex items-center justify-center text-2xl font-bold text-sage-700 shadow-soft mb-2">
                {persona.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-gray-800">{persona.name}</p>
              <p className="text-xs text-gray-500 mb-3">{persona.relationship}</p>
              <div className="flex flex-wrap justify-center gap-1">
                {persona.personality.slice(0, 2).map(t => (
                  <span key={t} className="tag bg-sage-50 text-sage-600 text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Emotion panel */}
          <div className="glass-card p-4 flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Feeling right now</p>
            <EmotionPulse
              emotion={currentEmotion.emotion}
              intensity={currentEmotion.intensity}
              subtext={currentEmotion.subtext}
            />
          </div>

          {/* Tips toggle */}
          {scenarioData.tips && scenarioData.tips.length > 0 && (
            <div className="glass-card p-4">
              <button
                onClick={() => setTipVisible(v => !v)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-sage-600 transition-colors"
              >
                <span className="flex items-center gap-1.5"><Info size={12} /> Coach tips</span>
                <ChevronDown size={12} className={`transition-transform ${tipVisible ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {tipVisible && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 space-y-2"
                  >
                    {scenarioData.tips.map((t, i) => (
                      <li key={i} className="text-xs text-gray-500 leading-relaxed flex gap-1.5">
                        <span className="text-peach-400 flex-shrink-0">•</span>
                        {t}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}
        </aside>

        {/* Chat area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4"
          >
            {/* Scenario banner */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full text-xs text-gray-500 border border-white/70">
                  <span className="font-medium text-gray-700">{scenario.title}</span> · {scenario.setting}
              </div>
            </motion.div>

            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} persona={persona} />
            ))}

            {/* Sending indicator */}
            <AnimatePresence>
              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage-200 to-mint-200 flex items-center justify-center text-xs font-bold text-sage-700 flex-shrink-0">
                    {persona.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft">
                    <span className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-sage-400"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-white/40 bg-white/30 backdrop-blur">
            {/* Voice listening banner */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mb-3 flex items-center justify-center gap-3"
                >
                  <div className="flex items-center gap-2.5 px-5 py-2.5 bg-red-50 border border-red-100 rounded-2xl">
                    {/* Animated waveform bars */}
                    <div className="flex items-end gap-0.5 h-4">
                      {[0.4,0.8,1,0.6,0.9,0.5,0.7].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-red-400"
                          animate={{ scaleY: [h, 1, h * 0.5, h] }}
                          transition={{ duration: 0.6, delay: i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ height: '100%', originY: 1 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-red-500">Listening… speak now</span>
                    <button onClick={toggleVoice} className="text-red-400 hover:text-red-600 transition-colors">
                      <MicOff size={13} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              {/* Voice button */}
              {voiceSupported && (
                <motion.button
                  onClick={toggleVoice}
                  disabled={sending || evaluating}
                  whileTap={{ scale: 0.92 }}
                  className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${ isListening
                      ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105'
                      : 'bg-white/80 border border-white/80 text-gray-500 hover:text-sage-600 hover:border-sage-200 shadow-soft'
                    }`}
                >
                  {isListening ? <MicOff size={17} /> : <Mic size={17} />}
                </motion.button>
              )}

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? '🎤 Listening…' : `Respond to ${persona.name}… or press 🎤 to speak`}
                  rows={1}
                  disabled={sending || evaluating}
                  className="w-full bg-white/80 backdrop-blur border border-white/80 rounded-2xl px-4 py-3 text-sm text-gray-700
                    placeholder-gray-400 outline-none focus:ring-2 focus:ring-sage-300/50 resize-none
                    disabled:opacity-50 shadow-soft leading-relaxed"
                  style={{ minHeight: '46px', maxHeight: '120px' }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || evaluating}
                className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br from-sage-500 to-forest-500 text-white shadow-soft
                  hover:shadow-glow hover:scale-105 active:scale-95 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              {voiceSupported ? 'Press 🎤 to speak · Enter to send · Shift+Enter for new line' : 'Enter to send · Shift+Enter for new line'}
            </p>
          </div>
        </div>
      </div>

      {/* End session confirm overlay */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowEndConfirm(false)} />
            <motion.div
              className="glass-card-strong p-8 max-w-sm w-full text-center relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 flex items-center justify-center mb-4">
                <BarChart2 size={28} className="text-sage-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">End this session?</h3>
              <p className="text-sm text-gray-500 mb-6">
                You had <span className="font-medium text-sage-600">{userTurnCount} {userTurnCount === 1 ? 'exchange' : 'exchanges'}</span>.
                We'll analyse your conversation and give you a detailed coaching report.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Keep going
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white
                    bg-gradient-to-r from-sage-500 to-forest-500 shadow-soft
                    hover:shadow-glow transition-all"
                >
                  Get feedback
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluating overlay */}
      <AnimatePresence>
        {evaluating && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
            <motion.div
              className="relative z-10 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-center gap-3 mb-5">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 rounded-full bg-sage-400"
                    animate={{ y: [0, -14, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-1">Analysing your conversation…</p>
              <p className="text-sm text-gray-500">Your coach is reviewing every exchange</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper: rebuild display messages from raw history (for replay)
function rebuildDisplay(history, persona, openingMessage) {
  const msgs = [{ role: 'ai', content: openingMessage, emotion: 'calm', intensity: 0.4, subtext: '' }];
  history.forEach(m => {
    msgs.push({ role: m.role === 'user' ? 'user' : 'ai', content: m.content, emotion: 'calm', intensity: 0.5, subtext: '' });
  });
  return msgs;
}

function MessageBubble({ msg, persona }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <motion.div variants={bubbleVariants} initial="hidden" animate="show" className="flex justify-center">
        <span className="text-xs text-red-400 bg-red-50 px-3 py-1.5 rounded-full">{msg.content}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="show"
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage-200 to-mint-200 flex items-center justify-center text-xs font-bold text-sage-700 flex-shrink-0">
          {persona.name?.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-soft ${
            isUser
              ? 'bg-gradient-to-br from-sage-500 to-forest-500 text-white rounded-br-sm'
              : 'bg-white/85 backdrop-blur text-gray-700 rounded-bl-sm border border-white/80'
          }`}
        >
          {msg.content}
        </div>

        {/* Emotion badge under AI messages */}
        {!isUser && msg.emotion && (
          <EmotionPulse emotion={msg.emotion} intensity={msg.intensity} compact />
        )}
      </div>
    </motion.div>
  );
}
