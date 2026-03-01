import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ScenarioSetup from './components/ScenarioSetup';
import ScenarioCard from './components/ScenarioCard';
import ConversationInterface from './components/ConversationInterface';
import ImmersiveMode from './components/ImmersiveMode';
import FeedbackReport from './components/FeedbackReport';
import SocialApp from './social/App';
import InnerCircleApp from './inner-circle/App';
import ClarityEngineApp from './clarity-engine/App';
import MindCheckApp from './mind-check/App';
import JoyPage from './mind-check/components/JoyPage';
import SleepGuardianApp from './sleep-guardian/App';
import BurnoutDetectorApp from './burnout-detector/App';
import MindCafeApp from './mind-cafe/App';
import MainHub from './MainHub';

// Root shell: activeModule = null | 'simulator' | 'social'

const fade = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -16, scale: 0.99 },
};
const t = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

// ── Simulator sub-app ─────────────────────────────────────────────────────────
function SimulatorApp({ onBack }) {
  const [phase, setPhase] = useState('landing');
  const [scenarioData, setScenarioData] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [feedbackData, setFeedbackData] = useState(null);

  const handleReset = () => {
    setPhase('landing');
    setScenarioData(null);
    setConversationHistory([]);
    setFeedbackData(null);
  };

  return (
    <div className="sim-bg">
      <AnimatePresence mode="wait">
        {phase === 'landing' && (
          <motion.div key="landing" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
            <LandingPage onStart={() => setPhase('setup')} onBackToHub={onBack} />
          </motion.div>
        )}
        {phase === 'setup' && (
          <motion.div key="setup" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
            <ScenarioSetup
              onBack={() => setPhase('landing')}
              onScenarioReady={(data) => { setScenarioData(data); setPhase('scenario'); }}
            />
          </motion.div>
        )}
        {phase === 'scenario' && scenarioData && (
          <motion.div key="scenario" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
            <ScenarioCard
              data={scenarioData}
              onBegin={(mode) => setPhase(mode === 'immersive' ? 'immersive' : 'conversation')}
              onBack={() => setPhase('setup')}
            />
          </motion.div>
        )}
        {phase === 'conversation' && scenarioData && (
          <motion.div key="conversation" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
            <ConversationInterface
              scenarioData={scenarioData}
              history={conversationHistory}
              setHistory={setConversationHistory}
              onFeedbackReady={(feedback) => { setFeedbackData(feedback); setPhase('feedback'); }}
            />
          </motion.div>
        )}
        {phase === 'immersive' && scenarioData && (
          <motion.div key="immersive" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
            <ImmersiveMode
              scenarioData={scenarioData}
              history={conversationHistory}
              setHistory={setConversationHistory}
              onFeedbackReady={(feedback) => { setFeedbackData(feedback); setPhase('feedback'); }}
            />
          </motion.div>
        )}
        {phase === 'feedback' && feedbackData && (
          <motion.div key="feedback" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
            <FeedbackReport
              feedback={feedbackData}
              scenarioData={scenarioData}
              history={conversationHistory}
              onReplay={() => { setConversationHistory([]); setPhase('conversation'); }}
              onNewScenario={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Root shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [activeModule, setActiveModule] = useState(null); // null | 'simulator' | 'social'

  return (
    <AnimatePresence mode="wait">
      {activeModule === null && (
        <motion.div key="hub" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <MainHub onEnter={setActiveModule} />
        </motion.div>
      )}
      {activeModule === 'simulator' && (
        <motion.div key="simulator" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <SimulatorApp onBack={() => setActiveModule(null)} />
        </motion.div>
      )}
      {activeModule === 'social' && (
        <motion.div key="social" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <SocialApp onBack={() => setActiveModule(null)} />
        </motion.div>
      )}
      {activeModule === 'inner-circle' && (
        <motion.div key="inner-circle" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <InnerCircleApp onBack={() => setActiveModule(null)} />
        </motion.div>
      )}
      {activeModule === 'clarity-engine' && (
        <motion.div key="clarity-engine" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <ClarityEngineApp onBack={() => setActiveModule(null)} />
        </motion.div>
      )}
      {activeModule === 'mind-check' && (
        <motion.div key="mind-check" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <MindCheckApp onBack={() => setActiveModule(null)} />
        </motion.div>
      )}
      {activeModule === 'sleep-guardian' && (
        <motion.div key="sleep-guardian" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <SleepGuardianApp onBack={() => setActiveModule(null)} />
        </motion.div>
      )}
      {activeModule === 'burnout-detector' && (
        <motion.div key="burnout-detector" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <BurnoutDetectorApp onBack={() => setActiveModule(null)} />
        </motion.div>
      )}
      {activeModule === 'mind-cafe' && (
        <motion.div key="mind-cafe" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <MindCafeApp onBack={() => setActiveModule(null)} />
        </motion.div>
      )}
      {activeModule === 'joy' && (
        <motion.div key="joy" variants={fade} initial="initial" animate="animate" exit="exit" transition={t}>
          <JoyPage onDone={() => setActiveModule(null)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
