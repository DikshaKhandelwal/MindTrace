import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Star } from 'lucide-react';
import { CUSTOMERS, SELF_CUSTOMER } from './data/customers.js';
import { INGREDIENTS, getBrewName, scoreMatch, getReaction } from './data/ingredients.js';
import CustomerPanel from './components/CustomerPanel.jsx';
import BrewStation from './components/BrewStation.jsx';
import BrewAnimation from './components/BrewAnimation.jsx';
import SpillMachine from './components/SpillMachine.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import SoundMixer from './components/SoundMixer.jsx';
import CafeIllustration from './components/CafeIllustration.jsx';
import useAmbience from './hooks/useAmbience.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PHASES = { ENTRANCE: 'entrance', DIALOGUE: 'dialogue', BREWING: 'brewing', ANIMATING: 'animating', REACTION: 'reaction', SELF: 'self', NIGHT: 'night' };
const MAX_HEARTS = 5;
const SELF_BREW_THRESHOLD = 2;
const INK = '#2c1a0e';
const MUTED = '#9a7a62';

export default function MindCafeApp({ onBack }) {
  const [queue] = useState(() => shuffle(CUSTOMERS));
  const [queueIdx, setQueueIdx] = useState(0);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [phase, setPhase] = useState(PHASES.ENTRANCE);
  const [selected, setSelected] = useState([]);
  const [lastScore, setLastScore] = useState(null);
  const [lastReaction, setLastReaction] = useState(null);
  const [lastBrewName, setLastBrewName] = useState('');
  const [playerHearts, setPlayerHearts] = useState(MAX_HEARTS);
  const [totalServed, setTotalServed] = useState(0);
  const [xp, setXp] = useState(0);
  const [isNight, setIsNight] = useState(false);
  const [showSpill, setShowSpill] = useState(false);

  const ambience = useAmbience();
  const customer = phase === PHASES.SELF ? SELF_CUSTOMER : (queue[queueIdx % queue.length] || queue[0]);

  const handleDialogueNext = useCallback(() => {
    if (dialogueIdx < customer.dialogues.length - 1) {
      setDialogueIdx(d => d + 1);
    } else {
      setPhase(PHASES.BREWING);
    }
  }, [dialogueIdx, customer]);

  const toggleIngredient = useCallback((id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const handleServe = useCallback(() => {
    if (selected.length === 0) return;
    const brewName = getBrewName(selected);
    const score = scoreMatch(selected, customer.needs);
    const reaction = getReaction(score);
    setLastBrewName(brewName);
    setLastScore(score);
    setLastReaction(reaction);
    setPhase(PHASES.ANIMATING);
    setTimeout(() => {
      setPhase(PHASES.REACTION);
      setXp(x => x + reaction.xp);
      if (reaction.hearts < 0) setPlayerHearts(h => Math.max(0, h + reaction.hearts));
    }, 2200);
  }, [selected, customer]);

  const handleNext = useCallback(() => {
    const nextServed = totalServed + 1;
    setTotalServed(nextServed);
    setSelected([]);
    setDialogueIdx(0);
    setLastScore(null);
    setLastReaction(null);
    if (playerHearts <= SELF_BREW_THRESHOLD && phase !== PHASES.SELF) {
      setPhase(PHASES.SELF);
      return;
    }
    if (nextServed % 3 === 0) {
      setIsNight(true);
      setPhase(PHASES.NIGHT);
      setTimeout(() => { setIsNight(false); setQueueIdx(i => i + 1); setPhase(PHASES.ENTRANCE); }, 3500);
      return;
    }
    if (phase === PHASES.SELF) setPlayerHearts(MAX_HEARTS);
    setQueueIdx(i => i + 1);
    setPhase(PHASES.ENTRANCE);
  }, [totalServed, playerHearts, phase]);

  return (
    <div className="min-h-screen flex flex-col"
      style={{
        background: isNight ? '#e5d4b8' : '#f5ead8',
        transition: 'background 2s ease',
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(92,60,30,0.18)' }}>
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs tracking-widest uppercase"
          style={{ color: MUTED, fontFamily: 'monospace', letterSpacing: '0.12em' }}>
          <ArrowLeft size={12} /> Hub
        </button>
        {/* Hearts */}
        <div className="flex items-center gap-1">
          {[...Array(MAX_HEARTS)].map((_, i) => (
            <span key={i} style={{ fontSize: 12, opacity: i < playerHearts ? 1 : 0.2, color: '#c0392b' }}>❤</span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star size={10} style={{ color: '#c2820a' }} />
            <span style={{ fontSize: 11, color: '#c2820a', fontFamily: 'monospace' }}>{xp} xp</span>
          </div>
          <button onClick={() => setShowSpill(s => !s)}
            className="text-xs px-2.5 py-1 transition-all"
            style={{
              border: '1px solid rgba(92,60,30,0.3)', color: MUTED,
              fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em',
              background: showSpill ? 'rgba(92,60,30,0.08)' : 'transparent',
            }}>
            🌫 Spill
          </button>
          <span style={{ fontSize: 10, color: MUTED, fontFamily: 'monospace' }}>
            Served: {totalServed}
          </span>
        </div>
      </div>

      {/* ── Three-column layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Music */}
        <div className="hidden lg:flex flex-col w-56 shrink-0 px-6 pt-8 pb-6"
          style={{ borderRight: '1px solid rgba(92,60,30,0.12)' }}>
          <MusicPlayer />
        </div>

        {/* CENTER — Illustration + game */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto">

          {/* Line art illustration */}
          <div className="w-full max-w-lg px-6 pt-6"
            style={{ opacity: phase === PHASES.ENTRANCE ? 1 : 0.3, transition: 'opacity 0.8s' }}>
            <CafeIllustration isNight={isNight} />
          </div>

          {/* Night overlay */}
          <AnimatePresence>
            {phase === PHASES.NIGHT && (
              <motion.div key="night"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 flex flex-col items-center justify-center"
                style={{ background: 'rgba(28,18,8,0.84)', backdropFilter: 'blur(4px)' }}>
                <div className="text-5xl mb-4">🌙</div>
                <p style={{ color: '#fef3c7', fontFamily: 'Georgia, serif', fontSize: 22 }}>The café grows quieter.</p>
                <p className="mt-2 text-xs tracking-widest uppercase"
                  style={{ color: 'rgba(253,186,116,0.45)', fontFamily: 'monospace' }}>
                  Night brings heavier orders
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game panel */}
          <div className="w-full max-w-lg px-6 pb-10">
            <AnimatePresence mode="wait">

              {/* ENTRANCE */}
              {phase === PHASES.ENTRANCE && (
                <motion.div key="entrance"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }} className="text-center">
                  <div className="inline-block w-full px-6 py-5"
                    style={{ background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(92,60,30,0.2)' }}>
                    <div className="text-5xl mb-3">{customer.avatar}</div>
                    <p className="font-bold text-base mb-0.5" style={{ color: INK }}>{customer.name}</p>
                    <p className="text-xs italic mb-4" style={{ color: MUTED }}>{customer.role}</p>
                    <p className="text-sm italic leading-relaxed mb-5 text-left"
                      style={{ color: '#6b4c30', borderLeft: '2px solid rgba(92,60,30,0.25)', paddingLeft: 12 }}>
                      {isNight && customer.nightDialogue ? customer.nightDialogue : customer.hint}
                    </p>
                    <button onClick={() => setPhase(PHASES.DIALOGUE)}
                      className="px-6 py-2.5 text-xs transition-all"
                      style={{ background: INK, color: '#fef3c7', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                      Listen →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* DIALOGUE */}
              {phase === PHASES.DIALOGUE && (
                <CustomerPanel key="dialogue" customer={customer} dialogueIdx={dialogueIdx}
                  isNight={isNight} onNext={handleDialogueNext} />
              )}

              {/* BREWING */}
              {phase === PHASES.BREWING && (
                <BrewStation key="brewing" customer={customer} selected={selected}
                  onToggle={toggleIngredient} onServe={handleServe}
                  ingredients={INGREDIENTS} isSelf={customer.id === 'self'} />
              )}

              {/* ANIMATING */}
              {phase === PHASES.ANIMATING && (
                <BrewAnimation key="animating" selected={selected} brewName={lastBrewName} ingredients={INGREDIENTS} />
              )}

              {/* REACTION */}
              {phase === PHASES.REACTION && lastReaction && (
                <motion.div key="reaction"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }} className="text-center">
                  <div className="w-full px-6 py-5"
                    style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(92,60,30,0.2)' }}>
                    <div className="text-5xl mb-3">{lastReaction.emoji}</div>
                    <p className="text-xs tracking-widest uppercase mb-1"
                      style={{ color: MUTED, fontFamily: 'monospace' }}>☕ {lastBrewName}</p>
                    <div className="my-4 px-4 py-3 text-left"
                      style={{ borderLeft: `2px solid ${lastReaction.border}`, background: lastReaction.color + '20' }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: lastReaction.border, fontFamily: 'monospace' }}>{lastReaction.label}</p>
                      <p className="text-sm italic leading-relaxed" style={{ color: '#4a2c10' }}>
                        "{lastReaction.text}"
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mb-4 mx-auto max-w-xs">
                      <span className="text-xs" style={{ color: MUTED, fontFamily: 'monospace' }}>Match</span>
                      <div className="flex-1 h-1" style={{ background: 'rgba(92,60,30,0.15)' }}>
                        <motion.div className="h-full" initial={{ width: 0 }}
                          animate={{ width: `${Math.round(lastScore * 100)}%` }}
                          transition={{ duration: 1.2, delay: 0.2 }}
                          style={{ background: lastReaction.border }} />
                      </div>
                      <span className="text-xs font-bold"
                        style={{ color: lastReaction.border, fontFamily: 'monospace' }}>
                        {Math.round(lastScore * 100)}%
                      </span>
                    </div>
                    {lastReaction.xp > 0 && (
                      <p className="text-xs mb-3" style={{ color: '#c2820a', fontFamily: 'monospace' }}>+{lastReaction.xp} ✨</p>
                    )}
                    {lastReaction.hearts < 0 && (
                      <div className="flex items-center justify-center gap-1.5 mb-3 text-xs"
                        style={{ color: '#b91c1c', fontFamily: 'monospace' }}>
                        <Heart size={10} /> You're getting tired.
                      </div>
                    )}
                    <button onClick={handleNext}
                      className="px-6 py-2.5 text-xs transition-all mt-1"
                      style={{ background: INK, color: '#fef3c7', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                      {playerHearts <= SELF_BREW_THRESHOLD ? 'Make yourself a drink →' : 'Next customer →'}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — Ambience */}
        <div className="hidden lg:flex flex-col w-52 shrink-0 px-5 pt-8 pb-6"
          style={{ borderLeft: '1px solid rgba(92,60,30,0.12)' }}>
          <SoundMixer {...ambience} />
        </div>
      </div>

      {/* Spill overlay */}
      <AnimatePresence>
        {showSpill && <SpillMachine onClose={() => setShowSpill(false)} />}
      </AnimatePresence>

      {/* Bottom bar */}
      <div className="text-center py-2.5 shrink-0 text-[10px] tracking-widest uppercase"
        style={{ color: 'rgba(92,60,30,0.3)', fontFamily: 'monospace', borderTop: '1px solid rgba(92,60,30,0.1)' }}>
        {phase === PHASES.BREWING ? 'Select up to 3 ingredients · Then serve' : 'Mind Café · Every cup tells a story'}
      </div>
    </div>
  );
}
