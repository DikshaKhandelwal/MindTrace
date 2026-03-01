/**
 * SleepStoryGen.jsx
 * Personal bedtime story — mood + place → AI story + ambient sound + spoken narration.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createAmbient, PLACE_AMBIENT } from '../data/ambientAudio';

const BACKEND = import.meta.env.VITE_API_URL || '';

// ── TTS helpers ───────────────────────────────────────────────────────────────
function stripPauseTags(text) {
  return text.replace(/\[pause\]/g, '...');
}

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const preferred = [
    'Google UK English Female',
    'Microsoft Hazel Online (Natural) - English (United Kingdom)',
    'Microsoft Zira - English (United States)',
    'Karen', 'Samantha', 'Victoria',
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  return voices.find(v => v.lang?.startsWith('en') && v.name.toLowerCase().includes('female'))
    ?? voices.find(v => v.lang?.startsWith('en'))
    ?? voices[0] ?? null;
}

function speakStory(text) {
  if (!window.speechSynthesis) return null;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(stripPauseTags(text));
  utter.rate   = 0.78;
  utter.pitch  = 0.94;
  utter.volume = 0.92;
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
  return utter;
}

// ── Options ───────────────────────────────────────────────────────────────────
const MOODS = [
  { key: 'calm',     label: 'Calm',     emoji: '😌' },
  { key: 'anxious',  label: 'Anxious',  emoji: '😰' },
  { key: 'restless', label: 'Restless', emoji: '😤' },
  { key: 'sleepy',   label: 'Sleepy',   emoji: '😴' },
  { key: 'wired',    label: 'Wired',    emoji: '⚡' },
  { key: 'tender',   label: 'Tender',   emoji: '🌸' },
];

const PLACES = [
  { key: 'beach',     label: 'Beach',     emoji: '🌊' },
  { key: 'mountains', label: 'Mountains', emoji: '🏔️' },
  { key: 'space',     label: 'Space',     emoji: '🚀' },
  { key: 'forest',    label: 'Forest',    emoji: '🌲' },
  { key: 'rain',      label: 'Rain',      emoji: '🌧️' },
  { key: 'clouds',    label: 'Clouds',    emoji: '☁️' },
];

// ── Tokenise story text ───────────────────────────────────────────────────────
function tokenise(raw) {
  const segs = raw.split('[pause]');
  const tokens = [];
  segs.forEach((seg, i) => {
    seg.trim().split(/\s+/).filter(Boolean).forEach(w => tokens.push({ type: 'word', word: w }));
    if (i < segs.length - 1) tokens.push({ type: 'pause' });
  });
  return tokens;
}

// ── Luna pulse (loading) ──────────────────────────────────────────────────────
function LunaPulse() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl select-none"
      >
        🌙
      </motion.div>
      <p className="text-indigo-400 text-xs font-mono italic">Luna is writing your story…</p>
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Story reader ──────────────────────────────────────────────────────────────
function StoryReader({ story, voiceOn, onRestart }) {
  const tokens = tokenise(story);
  const [tokenIdx, setTokenIdx]     = useState(0);
  const [paragraphs, setParagraphs] = useState([[]]); // array of word arrays
  const [pausing, setPausing]       = useState(false);
  const [done, setDone]             = useState(false);
  const [drifting, setDrifting]     = useState(false); // user is falling asleep
  const utterRef = useRef(null);
  const scrollRef = useRef(null);

  function handleDrift() {
    window.speechSynthesis?.cancel();
    setDrifting(true);
    setPausing(false);
  }

  // ── TTS ──
  useEffect(() => {
    if (!voiceOn) {
      window.speechSynthesis?.cancel();
      utterRef.current = null;
      return;
    }
    const start = () => {
      const utter = speakStory(story);
      utterRef.current = utter;
    };
    // Voices may not be ready immediately on first load
    if (window.speechSynthesis?.getVoices().length > 0) {
      start();
    } else if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => { start(); };
    }
    return () => { window.speechSynthesis?.cancel(); };
  }, [story, voiceOn]);

  // Advance tokens
  useEffect(() => {
    if (drifting || done || tokenIdx >= tokens.length) {
      if (tokenIdx >= tokens.length) setDone(true);
      return;
    }
    const t = tokens[tokenIdx];
    if (t.type === 'pause') {
      setPausing(true);
      const id = setTimeout(() => {
        setPausing(false);
        setParagraphs(prev => [...prev, []]);
        setTokenIdx(i => i + 1);
      }, 2600);
      return () => clearTimeout(id);
    }
    const delay = 95 + Math.random() * 40; // slight natural variance
    const id = setTimeout(() => {
      setParagraphs(prev => {
        const next = prev.map((p, i) => i < prev.length - 1 ? p : [...p, t.word]);
        return next;
      });
      setTokenIdx(i => i + 1);
    }, delay);
    return () => clearTimeout(id);
  }, [tokenIdx, done, tokens.length]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [paragraphs]);

  return (
    <div className="relative flex flex-col gap-0">

      {/* ── Drift-off overlay ── */}
      <AnimatePresence>
        {drifting && (
          <motion.div
            key="drift"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-b-2xl"
            style={{ background: 'rgba(10,6,28,0.97)', minHeight: 200 }}
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-4xl select-none"
            >
              🌙
            </motion.div>
            <p className="text-indigo-400 text-xs font-mono italic tracking-widest">drifting off…</p>
            <button
              onClick={onRestart}
              className="mt-3 text-indigo-800 hover:text-indigo-600 transition-colors text-[10px] font-mono"
            >
              ↺ new story
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story text */}
      <div
        className="overflow-y-auto px-5 py-4"
        style={{ maxHeight: 320, scrollbarWidth: 'none' }}
      >
        {paragraphs.map((para, pi) => (
          <p
            key={pi}
            className="font-mono text-sm leading-8 mb-3 text-indigo-100"
            style={{ fontStyle: 'normal', letterSpacing: '0.01em' }}
          >
            {para.join(' ')}
            {/* Cursor blinks in last para while still writing */}
            {pi === paragraphs.length - 1 && !done && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="inline-block w-0.5 h-4 ml-0.5 align-middle rounded-sm"
                style={{ background: '#818cf8' }}
              />
            )}
          </p>
        ))}

        {/* Pause breath indicator */}
        <AnimatePresence>
          {pausing && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-indigo-600 text-xs font-mono tracking-[0.4em] py-2"
            >
              · · ·
            </motion.p>
          )}
        </AnimatePresence>

        {/* Done message */}
        {done && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-indigo-500 text-xs font-mono mt-4 italic"
          >
            🌙 sweet dreams.
          </motion.p>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Restart (after story done) */}
      {done && !drifting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="px-5 pt-1 pb-4 text-center"
        >
          <button
            onClick={onRestart}
            className="text-indigo-600 hover:text-indigo-400 transition-colors text-xs font-mono"
          >
            ↺ write a new story
          </button>
        </motion.div>
      )}

      {/* ── Drift-off button — visible while story is playing ── */}
      {!done && !drifting && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="px-5 pb-4 flex justify-center"
        >
          <button
            onClick={handleDrift}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[11px] transition-all"
            style={{
              background: 'rgba(10,6,28,0.70)',
              border: '1px solid rgba(129,140,248,0.18)',
              color: '#6366f1',
              letterSpacing: '0.04em',
            }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌙
            </motion.span>
            I'm drifting off
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Control bar (ambient + voice) ────────────────────────────────────────────
function ControlBar({ ambientType, ambientOn, onAmbientToggle, voiceOn, onVoiceToggle }) {
  return (
    <div className="flex items-center gap-2 px-5 py-2.5 border-t border-indigo-800/30 flex-wrap">

      {/* Ambient button */}
      <button
        onClick={onAmbientToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-colors"
        style={{
          background: ambientOn ? 'rgba(129,140,248,0.15)' : 'rgba(129,140,248,0.04)',
          border: '1px solid rgba(129,140,248,0.20)',
          color: ambientOn ? '#a5b4fc' : '#4338ca',
        }}
      >
        {ambientOn ? '🔊' : '🔇'}
        <span>{ambientType}</span>
        {ambientOn && (
          <span className="flex gap-px items-end h-2.5 ml-0.5">
            {[2,4,1,3,2].map((h, i) => (
              <motion.span key={i} className="w-px rounded-full bg-indigo-400"
                style={{ display: 'inline-block' }}
                animate={{ height: [h, h + 3, h] }}
                transition={{ duration: 0.7, delay: i * 0.1, repeat: Infinity }} />
            ))}
          </span>
        )}
      </button>

      {/* Voice / narration button */}
      <button
        onClick={onVoiceToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all"
        style={{
          background: voiceOn ? 'rgba(192,132,252,0.18)' : 'rgba(192,132,252,0.04)',
          border: '1px solid rgba(192,132,252,0.22)',
          color: voiceOn ? '#e879f9' : '#7c3aed',
        }}
      >
        🎙️ <span>{voiceOn ? 'Narration on' : 'Narration off'}</span>
      </button>

    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SleepStoryGen() {
  const [mood,  setMood]  = useState('calm');
  const [place, setPlace] = useState('beach');
  const [phase, setPhase] = useState('setup');  // setup | generating | story
  const [story, setStory] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const [voiceOn,   setVoiceOn]   = useState(true);   // narration on by default

  const ambientRef  = useRef(null);
  const ambientType = PLACE_AMBIENT[place] ?? 'ocean';

  // Clean up ambient + speech on unmount
  useEffect(() => () => {
    ambientRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  function toggleAmbient() {
    if (ambientOn) {
      ambientRef.current?.stop();
      ambientRef.current = null;
      setAmbientOn(false);
    } else {
      ambientRef.current = createAmbient(ambientType);
      setAmbientOn(true);
    }
  }

  async function generate() {
    setPhase('generating');
    // Start ambient automatically
    ambientRef.current?.stop();
    ambientRef.current = createAmbient(ambientType);
    setAmbientOn(true);

    try {
      const res = await fetch(`${BACKEND}/api/sleep/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, place }),
      });
      const data = await res.json();
      setStory(data.story ?? '');
      setIsDemo(data.demo ?? false);
      setPhase('story');
    } catch {
      // Network error: use a gentle fallback note
      setStory(`You are somewhere soft and quiet.\nThe day is done. You have done enough. [pause] Breathing in. Breathing out. [pause] And now, gently, sleep.`);
      setIsDemo(true);
      setPhase('story');
    }
  }

  function toggleVoice() {
    if (voiceOn) window.speechSynthesis?.cancel();
    setVoiceOn(v => !v);
  }

  function restart() {
    window.speechSynthesis?.cancel();
    ambientRef.current?.stop();
    ambientRef.current = null;
    setAmbientOn(false);
    setStory('');
    setIsDemo(false);
    setPhase('setup');
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 mt-1">
        <span className="font-mono text-indigo-200 text-sm font-bold tracking-widest uppercase">
          Sleep Story
        </span>
        <span
          className="px-1.5 py-0.5 rounded text-[9px] font-black"
          style={{ background: 'rgba(192,132,252,0.80)', color: '#fff' }}
        >
          AI
        </span>
        {isDemo && phase === 'story' && (
          <span className="ml-auto text-[9px] font-mono text-indigo-600 italic">demo story</span>
        )}
      </div>
      <p className="text-indigo-500 text-[10px] font-mono italic mb-5">
        &ldquo;Your place, your pace, your story.&rdquo;
      </p>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(129,140,248,0.18)', background: 'rgba(30,22,60,0.50)' }}
      >
        <AnimatePresence mode="wait">

          {/* ── SETUP ── */}
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-5 py-5"
            >
              {/* Mood */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <p className="text-[9px] font-mono font-black uppercase tracking-widest text-indigo-500">
                    How are you feeling?
                  </p>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-black"
                    style={{ background: 'rgba(80,10,40,0.70)', color: '#fff' }}
                  >
                    {MOODS.length}
                  </span>
                </div>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(129,140,248,0.12)' }}
                >
                  {MOODS.map((m, i) => (
                    <button
                      key={m.key}
                      onClick={() => setMood(m.key)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        borderBottom: i < MOODS.length - 1 ? '1px solid rgba(129,140,248,0.08)' : 'none',
                        background: mood === m.key ? 'rgba(129,140,248,0.12)' : 'transparent',
                      }}
                    >
                      <span
                        className="text-[10px] font-black font-mono w-4 shrink-0 tabular-nums"
                        style={{ color: 'rgba(129,140,248,0.40)' }}
                      >
                        {String(i + 1).padStart(2,'0')}.
                      </span>
                      <span className="text-sm shrink-0">{m.emoji}</span>
                      <span className="flex-1 text-xs font-mono text-indigo-200">{m.label}</span>
                      {mood === m.key && (
                        <span className="text-[10px] font-black shrink-0" style={{ color: '#818cf8' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Place */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2.5">
                  <p className="text-[9px] font-mono font-black uppercase tracking-widest text-indigo-500">
                    Take me to…
                  </p>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-black"
                    style={{ background: 'rgba(80,10,40,0.70)', color: '#fff' }}
                  >
                    {PLACES.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PLACES.map(p => (
                    <button
                      key={p.key}
                      onClick={() => setPlace(p.key)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-center transition-all"
                      style={{
                        border: place === p.key
                          ? '1.5px solid rgba(129,140,248,0.50)'
                          : '1px solid rgba(129,140,248,0.12)',
                        background: place === p.key ? 'rgba(129,140,248,0.12)' : 'rgba(129,140,248,0.03)',
                      }}
                    >
                      <span className="text-xl">{p.emoji}</span>
                      <span className="text-[9px] font-mono text-indigo-400">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice toggle */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setVoiceOn(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all"
                  style={{
                    background: voiceOn ? 'rgba(192,132,252,0.15)' : 'rgba(192,132,252,0.04)',
                    border: '1px solid rgba(192,132,252,0.22)',
                    color: voiceOn ? '#e879f9' : '#7c3aed',
                  }}
                >
                  🎙️ {voiceOn ? 'Voice narration on' : 'Voice narration off'}
                </button>
              </div>

              {/* Generate */}
              <button
                onClick={generate}
                className="w-full py-3.5 rounded-xl font-mono font-bold text-sm text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(129,140,248,0.8), rgba(192,132,252,0.8))',
                  boxShadow: '0 4px 24px rgba(129,140,248,0.25)',
                }}
              >
                {MOODS.find(m => m.key === mood)?.emoji}{' '}
                Write my story{' '}
                {PLACES.find(p => p.key === place)?.emoji}
              </button>
            </motion.div>
          )}

          {/* ── GENERATING ── */}
          {phase === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LunaPulse />
            </motion.div>
          )}

          {/* ── STORY ── */}
          {phase === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Story header */}
              <div className="px-5 pt-4 pb-2 border-b border-indigo-800/25 flex items-center gap-2">
                <span className="text-base">{PLACES.find(p => p.key === place)?.emoji}</span>
                <span className="font-mono text-indigo-300 text-xs font-bold capitalize">{place}</span>
                <span className="text-indigo-700">·</span>
                <span className="text-base">{MOODS.find(m => m.key === mood)?.emoji}</span>
                <span className="font-mono text-indigo-500 text-xs capitalize">{mood} night</span>
                {voiceOn && (
                  <motion.span className="ml-auto text-[9px] font-mono text-purple-500 italic"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}>🎙️ narrating</motion.span>
                )}
              </div>

              {/* Text */}
              <StoryReader story={story} voiceOn={voiceOn} onRestart={restart} />

              {/* Controls */}
              <ControlBar
                ambientType={ambientType}
                ambientOn={ambientOn}
                onAmbientToggle={toggleAmbient}
                voiceOn={voiceOn}
                onVoiceToggle={toggleVoice}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
