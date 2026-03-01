/**
 * TypingMonitor.jsx
 * Real-time typing speed & accuracy monitor.
 * Uses actual keydown events — no mock data.
 * Measures: WPM (rolling 60s window), backspace error rate, inter-burst pause.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Play, Square, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { scoreTypingSignals, BDStore } from '../data/burnoutSignals';

const BLK = '1.5px solid #111';

// ── Gauge arc (SVG) ───────────────────────────────────────────────────────────
function WpmGauge({ wpm, maxWpm = 120 }) {
  const pct  = Math.min(wpm / maxWpm, 1);
  const R    = 46, CX = 56, CY = 56;
  const arc  = Math.PI * R;  // half circle
  const used = arc * pct;
  const color = wpm < 20 ? '#dc2626' : wpm < 45 ? '#f97316' : wpm < 70 ? '#eab308' : '#16a34a';

  return (
    <svg width={112} height={72} viewBox="0 0 112 72">
      {/* Track */}
      <path d={`M 10 56 A 46 46 0 0 1 102 56`}
        fill="none" stroke="#e5e7eb" strokeWidth={8} strokeLinecap="round" />
      {/* Filled */}
      <path d={`M 10 56 A 46 46 0 0 1 102 56`}
        fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={`${used} ${arc}`} />
      <text x={56} y={52} textAnchor="middle" fontSize={20} fontWeight={900} fontFamily="monospace" fill="#111">
        {wpm}
      </text>
      <text x={56} y={64} textAnchor="middle" fontSize={9} fontWeight={700} fontFamily="monospace" fill="#888">
        WPM
      </text>
    </svg>
  );
}

// ── MiniSpark ─────────────────────────────────────────────────────────────────
function Spark({ data, color = '#f97316' }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 80},${28 - (v / max) * 24}`).join(' ');
  return (
    <svg width={80} height={30} viewBox="0 0 80 30">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TypingMonitor({ onScoreReady }) {
  const [isActive, setIsActive]       = useState(false);
  const [text, setText]               = useState('');
  const [wpm, setWpm]                 = useState(0);
  const [backspaceRate, setBackspaceRate] = useState(0);
  const [avgPauseMs, setAvgPauseMs]   = useState(0);
  const [wpmHistory, setWpmHistory]   = useState([]);      // per-10s snapshots
  const [savedSamples, setSavedSamples] = useState(() => BDStore.getTypingSamples());
  const [sessionSaved, setSessionSaved] = useState(false);

  // Refs for live metrics (avoid stale closures in event handlers)
  const keystrokesRef    = useRef([]);  // { char, ts }
  const backspaceRef     = useRef(0);
  const totalKeysRef     = useRef(0);
  const lastKeystrokeRef = useRef(null);
  const pausesRef        = useRef([]);
  const wpmIntervalRef   = useRef(null);
  const textareaRef      = useRef(null);

  // ── Compute rolling 60s WPM ──
  const computeWpm = useCallback(() => {
    const now = Date.now();
    const window60 = keystrokesRef.current.filter(k => (now - k.ts) < 60_000 && k.char !== 'Backspace');
    const words = window60.length / 5;  // standard: 5 keystrokes per word
    const minutes = Math.min(60_000, now - (window60[0]?.ts || now)) / 60_000;
    return minutes > 0 ? Math.round(words / minutes) : 0;
  }, []);

  // ── Key event handler ──
  const handleKeyDown = useCallback((e) => {
    if (!isActive) return;
    const now = Date.now();

    // Pause detection (gap > 2s between keystrokes)
    if (lastKeystrokeRef.current && (now - lastKeystrokeRef.current) > 2000) {
      pausesRef.current.push(now - lastKeystrokeRef.current);
    }
    lastKeystrokeRef.current = now;

    keystrokesRef.current.push({ char: e.key, ts: now });
    totalKeysRef.current++;
    if (e.key === 'Backspace') backspaceRef.current++;
  }, [isActive]);

  // ── Attach/detach listener ──
  useEffect(() => {
    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      wpmIntervalRef.current = setInterval(() => {
        const live = computeWpm();
        setWpm(live);
        const br = totalKeysRef.current > 0
          ? backspaceRef.current / totalKeysRef.current : 0;
        setBackspaceRate(+br.toFixed(3));
        const ap = pausesRef.current.length > 0
          ? pausesRef.current.reduce((a, b) => a + b, 0) / pausesRef.current.length : 0;
        setAvgPauseMs(Math.round(ap));
        setWpmHistory(h => [...h.slice(-19), live]);  // keep last 20 snapshots
      }, 3000);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(wpmIntervalRef.current);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(wpmIntervalRef.current);
    };
  }, [isActive, handleKeyDown, computeWpm]);

  const startSession = () => {
    keystrokesRef.current    = [];
    backspaceRef.current     = 0;
    totalKeysRef.current     = 0;
    lastKeystrokeRef.current = null;
    pausesRef.current        = [];
    setWpm(0); setBackspaceRate(0); setAvgPauseMs(0);
    setWpmHistory([]); setSessionSaved(false); setText('');
    setIsActive(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const stopSession = () => {
    setIsActive(false);
    const finalWpm = computeWpm();
    const finalBpr = totalKeysRef.current > 0 ? backspaceRef.current / totalKeysRef.current : 0;
    const finalPause = pausesRef.current.length > 0
      ? pausesRef.current.reduce((a, b) => a + b, 0) / pausesRef.current.length : 0;

    const sample = {
      wpm: finalWpm,
      backspaceRate: +finalBpr.toFixed(3),
      avgPauseMs: Math.round(finalPause),
      keystrokes: totalKeysRef.current,
    };
    BDStore.saveTypingSample(sample);
    const all = BDStore.getTypingSamples();
    setSavedSamples(all);
    setSessionSaved(true);
    const scored = scoreTypingSignals(all);
    onScoreReady?.(scored);
  };

  const clearHistory = () => {
    BDStore.clearTyping();
    setSavedSamples([]);
    onScoreReady?.({ score: 0, detail: {} });
  };

  // ── WPM trend arrow ──
  const wpmTrend = () => {
    if (wpmHistory.length < 4) return null;
    const half = Math.floor(wpmHistory.length / 2);
    const early = wpmHistory.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const late  = wpmHistory.slice(half).reduce((a, b) => a + b, 0) / (wpmHistory.length - half);
    if (late < early - 5) return <TrendingDown size={12} className="text-red-500" />;
    if (late > early + 5) return <TrendingUp size={12} className="text-green-600" />;
    return <Minus size={12} className="text-yellow-500" />;
  };

  const scoredSamples = scoreTypingSignals(savedSamples);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Session area ── */}
      <div className="p-4" style={{ background: '#fff', border: BLK, boxShadow: '2px 2px 0 #111' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Keyboard size={14} />
            <span className="text-xs font-black font-mono uppercase tracking-wider">Live Typing Monitor</span>
          </div>
          {isActive && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black font-mono"
              style={{ background: '#f0fdf4', border: '1px solid #16a34a', color: '#16a34a' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              RECORDING
            </span>
          )}
        </div>

        {/* Gauge row */}
        <div className="flex items-center justify-around mb-3">
          <div className="flex flex-col items-center">
            <WpmGauge wpm={wpm} />
            <div className="flex items-center gap-1 mt-1">{wpmTrend()}</div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Error Rate', val: `${(backspaceRate * 100).toFixed(1)}%`, bad: backspaceRate > 0.15 },
              { label: 'Avg Pause', val: `${(avgPauseMs / 1000).toFixed(1)}s`, bad: avgPauseMs > 3000 },
              { label: 'Keystrokes', val: totalKeysRef.current, bad: false },
            ].map(s => (
              <div key={s.label} className="text-right">
                <p className="text-[8px] font-mono text-black/40 uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-black font-mono" style={{ color: s.bad ? '#dc2626' : '#111' }}>
                  {s.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Spark & textarea */}
        {wpmHistory.length > 2 && (
          <div className="mb-2">
            <p className="text-[8px] font-mono text-black/35 mb-0.5">WPM over session →</p>
            <Spark data={wpmHistory} color={wpm < 30 ? '#dc2626' : '#f97316'} />
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={!isActive}
          rows={4}
          placeholder={isActive
            ? "Start typing anything — a thought, code, notes. Your real speed and accuracy are being measured…"
            : "Press Start Session to begin. Type naturally — no prompts, no judgment."}
          className="w-full text-xs font-mono p-2 resize-none focus:outline-none"
          style={{ border: BLK, background: isActive ? '#fffdf5' : '#f9f9f9' }}
        />

        {/* Controls */}
        <div className="flex gap-2 mt-2">
          {!isActive ? (
            <button onClick={startSession}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-black font-mono uppercase tracking-widest"
              style={{ border: BLK, background: '#111', color: '#fff' }}>
              <Play size={11} /> Start Session
            </button>
          ) : (
            <button onClick={stopSession}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-black font-mono uppercase tracking-widest"
              style={{ border: BLK, background: '#fef2f2', color: '#dc2626' }}>
              <Square size={11} /> Stop & Save
            </button>
          )}
        </div>

        {sessionSaved && (
          <p className="text-[10px] font-mono text-green-700 mt-1.5">
            ✓ Session saved — {savedSamples.length} sessions tracked
          </p>
        )}
      </div>

      {/* ── Historical summary ── */}
      {savedSamples.length > 0 && (
        <div style={{ border: BLK }}>
          <div className="px-3 py-2 flex items-center justify-between"
            style={{ borderBottom: BLK, background: '#f8f8f8' }}>
            <span className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50">
              Session History ({savedSamples.length} sessions)
            </span>
            <button onClick={clearHistory} className="flex items-center gap-1 text-[9px] font-mono text-black/40 hover:text-red-500">
              <Trash2 size={9} /> Clear
            </button>
          </div>
          {/* Aggregate score */}
          <div className="px-3 py-2 flex gap-4" style={{ borderBottom: BLK, background: scoredSamples.score > 60 ? '#fef2f2' : '#f0fdf4' }}>
            <div>
              <p className="text-[8px] font-mono text-black/40">Typing Burnout Signal</p>
              <p className="text-xl font-black font-mono">{scoredSamples.score}<span className="text-xs">/100</span></p>
            </div>
            <div className="text-[10px] font-mono text-black/60">
              <p>Avg WPM: <strong>{scoredSamples.detail.avgWpm}</strong></p>
              <p>Trend: <strong>{scoredSamples.detail.wpmTrend}</strong></p>
              <p>Error rate: <strong>{scoredSamples.detail.backspaceRate != null ? `${(scoredSamples.detail.backspaceRate*100).toFixed(1)}%` : '—'}</strong></p>
            </div>
          </div>
          {/* Last 5 sessions */}
          {savedSamples.slice(-5).reverse().map((s, i) => (
            <div key={i} className="px-3 py-1.5 flex gap-4 text-[10px] font-mono"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="text-black/35">{new Date(s.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span><strong>{s.wpm}</strong> WPM</span>
              <span className={s.backspaceRate > 0.15 ? 'text-red-500' : ''}><strong>{(s.backspaceRate * 100).toFixed(0)}%</strong> err</span>
              <span className={s.avgPauseMs > 3000 ? 'text-orange-500' : ''}>{(s.avgPauseMs / 1000).toFixed(1)}s pause</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
