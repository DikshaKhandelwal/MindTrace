import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SimRoom from './room/SimRoom';
import ImmersiveHUD from './room/ImmersiveHUD';

export default function ImmersiveMode({ scenarioData, history, setHistory, onFeedbackReady }) {
  const { scenario, persona, openingMessage } = scenarioData;

  // ── State ──────────────────────────────────────────────────
  const [roomType, setRoomType] = useState(null);
  const [ttsVoice, setTtsVoice] = useState('nova');
  const [loading, setLoading] = useState(true);
  const [subtitle, setSubtitle] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState({ emotion: 'calm', intensity: 0.4, subtext: '' });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(
    () => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );

  // ── Refs ───────────────────────────────────────────────────
  const internalHistory = useRef([]);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // ── Boot: fetch room type then play opening line ───────────
  useEffect(() => {
    const boot = async () => {
      try {
        const res = await axios.post('/api/simulator/room-type', {
          setting: scenario.setting,
          relationship: persona.relationship,
        });
        setRoomType(res.data.roomType || 'restaurant');
        setTtsVoice(res.data.voice || 'nova');
      } catch {
        setRoomType('restaurant');
      }
      setLoading(false);
      // Play opening message after a short pause
      setTimeout(() => speakText(openingMessage), 900);
    };
    boot();
  }, []);  // eslint-disable-line

  // ── TTS: speak a text string ───────────────────────────────
  const speakText = useCallback(async (text, voice) => {
    if (!text) return;
    setSubtitle(text);
    setIsTalking(true);
    try {
      const res = await axios.post(
        '/api/simulator/tts',
        { text, voice: voice || ttsVoice },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(res.data);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsTalking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setIsTalking(false);
      await audio.play();
    } catch {
      // TTS failed — still show subtitle, just no audio
      setTimeout(() => setIsTalking(false), Math.min(text.length * 55, 4000));
    }
  }, [ttsVoice]);

  // ── Send user message ──────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    setSubtitle('');

    const newHistory = [...internalHistory.current, { role: 'user', content: text }];

    try {
      const res = await axios.post('/api/simulator/chat', {
        persona,
        scenario,
        history: newHistory,
        userMessage: text,
      });
      const { message, emotion, intensity, subtext } = res.data;

      internalHistory.current = [...newHistory, { role: 'assistant', content: message }];
      setCurrentEmotion({ emotion, intensity, subtext });
      setSending(false);
      speakText(message);
    } catch {
      setSending(false);
    }
  }, [input, sending, persona, scenario, speakText]);

  // ── Voice input ────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (isListening) { recognitionRef.current?.stop(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onstart = () => setIsListening(true);
    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(x => x[0].transcript).join('');
      setInput(transcript);
    };
    r.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    r.onerror = () => { setIsListening(false); recognitionRef.current = null; };
    recognitionRef.current = r;
    r.start();
  }, [isListening]);

  // Auto-send when voice recognition ends with content
  useEffect(() => {
    if (!isListening && input.trim() && !sending) {
      const timer = setTimeout(() => { if (input.trim()) handleSend(); }, 600);
      return () => clearTimeout(timer);
    }
  }, [isListening]);  // eslint-disable-line

  // ── End session ────────────────────────────────────────────
  const handleEndSession = useCallback(async () => {
    if (internalHistory.current.length < 2) return;
    setEvaluating(true);
    setHistory(internalHistory.current);
    try {
      const res = await axios.post('/api/simulator/evaluate', {
        persona,
        scenario,
        history: internalHistory.current,
      });
      onFeedbackReady(res.data);
    } catch {
      setEvaluating(false);
    }
  }, [persona, scenario, setHistory, onFeedbackReady]);

  const exchangeCount = internalHistory.current.filter(m => m.role === 'user').length;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* ── Loading screen ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0a2e] to-[#0a1828]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex gap-3 mb-6">
              {['🏠', '🎭', '✨'].map((e, i) => (
                <motion.span
                  key={e}
                  className="text-5xl"
                  animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <p className="text-white text-lg font-semibold mb-2">Building your room…</p>
            <p className="text-white/50 text-sm">{scenario.setting}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3D Scene ── */}
      {!loading && roomType && (
        <SimRoom
          persona={persona}
          roomType={roomType}
          isTalking={isTalking}
          emotion={currentEmotion.emotion}
        />
      )}

      {/* ── HUD overlay ── */}
      {!loading && (
        <ImmersiveHUD
          persona={persona}
          currentEmotion={currentEmotion}
          subtitle={subtitle}
          isTalking={isTalking}
          isListening={isListening}
          onToggleVoice={toggleVoice}
          voiceSupported={voiceSupported}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          sending={sending}
          evaluating={evaluating}
          onEndSession={handleEndSession}
          exchangeCount={exchangeCount}
          roomType={roomType}
        />
      )}

      {/* ── Evaluating overlay ── */}
      <AnimatePresence>
        {evaluating && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div
              className="relative z-10 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {['🧠','📊','✨','🎯'].map((e, i) => (
                <motion.span
                  key={e}
                  className="text-4xl inline-block mx-2"
                  animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                >
                  {e}
                </motion.span>
              ))}
              <p className="text-white text-lg font-semibold mt-5 mb-1">Analysing your session…</p>
              <p className="text-white/60 text-sm">Your coach is reviewing every exchange</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
