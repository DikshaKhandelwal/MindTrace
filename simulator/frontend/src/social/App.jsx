import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Header from './components/Header';
import ModuleHome from './components/ModuleHome';
import CommunityFeed from './components/CommunityFeed';
import SupportCircles from './components/SupportCircles';
import CircleRoom from './components/CircleRoom';
import VentSpace from './components/VentSpace';
import DailyCheckIn from './components/DailyCheckIn';
import ResourceHub from './components/ResourceHub';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function SocialApp({ onBack }) {
  const [phase, setPhase] = useState('home');
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [feedFilter, setFeedFilter] = useState('all');

  function go(nextPhase, opts = {}) {
    if (opts.circle) setSelectedCircle(opts.circle);
    if (opts.filter) setFeedFilter(opts.filter);
    setPhase(nextPhase);
  }

  const phaseMap = {
    home:      <ModuleHome go={go} />,
    feed:      <CommunityFeed initialFilter={feedFilter} go={go} />,
    circles:   <SupportCircles go={go} />,
    circle:    <CircleRoom circle={selectedCircle} go={go} />,
    vent:      <VentSpace go={go} />,
    checkin:   <DailyCheckIn go={go} />,
    resources: <ResourceHub go={go} />,
  };

  return (
    <div className="social-bg">
      {/* Back to hub button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-700 bg-white/60 backdrop-blur-sm border border-white/60 px-3 py-1.5 rounded-full transition-colors shadow-sm"
        >
          <ArrowLeft size={13} />
          MindTrace Hub
        </button>
      </div>

      {phase !== 'home' && (
        <Header active={phase} go={go} />
      )}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {phaseMap[phase] ?? phaseMap['home']}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
