import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CheckLanding    from './components/CheckLanding';
import ContextGather   from './components/ContextGather';
import ScenarioRunner  from './components/ScenarioRunner';
import SignalResult    from './components/SignalResult';
import JoyPage         from './components/JoyPage';
import { scoreAnswers }       from './data/scenarios';
import { generateScenarios }  from './data/gptScenarios';

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};
const tr = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

// "Reading between the lines..." screen that fires GPT generation
function Generating({ userContext, promptKey, onReady }) {
  const LINES = [
    'reading between the lines',
    'building your situations',
    'shaping the details',
    'finding the right moments',
    'tuning the texture',
    'almost there',
  ];
  const [li, setLi] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setLi(l => l + 1), 2200);
    generateScenarios(userContext, promptKey).then(scenarios => {
      clearInterval(iv);
      onReady(scenarios);
    });
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="check-bg min-h-screen flex flex-col items-center justify-center gap-3">
      <motion.p
        key={li}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="font-mono text-sm text-black/40 tracking-widest"
      >
        {LINES[li % LINES.length]}...
      </motion.p>
    </div>
  );
}

// A brief "computing..." transition screen between last answer and result
function Computing({ onDone }) {
  const DOTS = ['...', '....', '.....', '....', '...', '..', '.'];
  const [di, setDi] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setDi(d => d + 1), 180);
    const to = setTimeout(() => { clearInterval(iv); onDone(); }, 1800);
    return () => { clearInterval(iv); clearTimeout(to); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="check-bg min-h-screen flex flex-col items-center justify-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono text-sm text-black/40 tracking-widest"
      >
        Reading signal{DOTS[di % DOTS.length]}
      </motion.p>
    </div>
  );
}

export default function MindCheckApp({ onBack }) {
  const [phase,       setPhase]       = useState('landing'); // landing | context | generating | check | computing | result | joy
  const [result,      setResult]      = useState(null);
  const [userContext, setUserContext] = useState('');
  const [promptKey,   setPromptKey]   = useState('week');
  const [scenarios,   setScenarios]   = useState(null);

  const handleComplete = (picks) => {
    const r = scoreAnswers(picks);
    setResult(r);
    setPhase('computing');
  };

  const handleRestart = () => {
    setResult(null);
    setScenarios(null);
    setUserContext('');
    setPhase('landing');
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'landing' && (
        <motion.div key="landing" variants={fade} initial="initial" animate="animate" exit="exit" transition={tr}>
          <CheckLanding onStart={() => setPhase('context')} onBack={onBack} />
        </motion.div>
      )}
      {phase === 'context' && (
        <motion.div key="context" variants={fade} initial="initial" animate="animate" exit="exit" transition={tr}>
          <ContextGather
            onContinue={(text, key) => {
              setUserContext(text);
              setPromptKey(key);
              setPhase('generating');
            }}
            onBack={() => setPhase('landing')}
          />
        </motion.div>
      )}
      {phase === 'generating' && (
        <motion.div key="generating" variants={fade} initial="initial" animate="animate" exit="exit" transition={tr}>
          <Generating
            userContext={userContext}
            promptKey={promptKey}
            onReady={(s) => { setScenarios(s); setPhase('check'); }}
          />
        </motion.div>
      )}
      {phase === 'check' && scenarios && (
        <motion.div key="check" variants={fade} initial="initial" animate="animate" exit="exit" transition={tr}>
          <ScenarioRunner scenarios={scenarios} onComplete={handleComplete} />
        </motion.div>
      )}
      {phase === 'computing' && (
        <motion.div key="computing" variants={fade} initial="initial" animate="animate" exit="exit" transition={tr}>
          <Computing onDone={() => setPhase('result')} />
        </motion.div>
      )}
      {phase === 'result' && result && (
        <motion.div key="result" variants={fade} initial="initial" animate="animate" exit="exit" transition={tr}>
          <SignalResult result={result} onRestart={handleRestart} onBack={onBack} onJoy={() => setPhase('joy')} />
        </motion.div>
      )}
      {phase === 'joy' && (
        <motion.div key="joy" variants={fade} initial="initial" animate="animate" exit="exit" transition={tr}>
          <JoyPage onDone={onBack} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
