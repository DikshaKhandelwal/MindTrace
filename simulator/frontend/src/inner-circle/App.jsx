import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CIRCLE_MEMBERS, MY_INITIAL_STATE } from './data/circle';
import { ArrowLeft, Users } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MemberDetail from './components/MemberDetail';
import SupportCompose from './components/SupportCompose';
import StateShare from './components/StateShare';
import Insights from './components/Insights';
import CheckHistory from './components/CheckHistory';
import AddMember from './components/AddMember';
import JoinCircle from './components/JoinCircle';
import SharedView from './components/SharedView';

const fade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit:    { opacity: 0, y: -14, transition: { duration: 0.22 } },
};

export default function InnerCircleApp({ onBack }) {
  const [phase, setPhase] = useState('dashboard');

  // ── Persistent state ───────────────────────────────────────────
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('ic_members');
      return saved ? JSON.parse(saved) : CIRCLE_MEMBERS;
    } catch { return CIRCLE_MEMBERS; }
  });

  const [myState, setMyState] = useState(() => {
    try {
      const saved = localStorage.getItem('ic_mystate');
      return saved ? JSON.parse(saved) : MY_INITIAL_STATE;
    } catch { return MY_INITIAL_STATE; }
  });

  useEffect(() => {
    localStorage.setItem('ic_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('ic_mystate', JSON.stringify(myState));
  }, [myState]);
  // ────────────────────────────────────────────────────────────────

  const [selected, setSelected] = useState(null);
  const [composeFor, setComposeFor] = useState(null);
  const [sharedData, setSharedData] = useState(null);

  function go(nextPhase, opts = {}) {
    if (opts.memberId) setSelected(opts.memberId);
    if (opts.composeFor) setComposeFor(opts.composeFor);
    setPhase(nextPhase);
  }

  function updateMemberMood(id, mood) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, currentMood: mood, streakDays: 1 } : m));
  }

  function deleteMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id));
    setPhase('dashboard');
  }

  function updateMemberNote(id, note) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, note } : m));
  }

  function addMember(member) {
    setMembers(prev => [...prev, { ...member, id: `m${Date.now()}` }]);
  }

  const selectedMember = members.find(m => m.id === selected);
  const composeTarget = members.find(m => m.id === composeFor);

  return (
    <div className="inner-bg min-h-screen flex flex-col">
      {/* ── Top nav ── */}
      <div className="fixed top-5 left-5 right-5 z-50 flex items-center justify-between">
        <button
          onClick={phase === 'dashboard' ? onBack : () => setPhase('dashboard')}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={16} />
          {phase === 'dashboard' ? 'MindTrace Hub' : 'Back'}
        </button>
        {/* Join a Circle link — visible only from dashboard */}
        {phase === 'dashboard' && (
          <button
            onClick={() => setPhase('join')}
            className="flex items-center gap-2 text-sm text-violet-300/50 hover:text-violet-200/90 transition-colors"
          >
            <Users size={14} />
            Join a Circle
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'dashboard' && (
          <motion.div key="dashboard" variants={fade} initial="initial" animate="animate" exit="exit">
            <Dashboard members={members} myState={myState} go={go} />
          </motion.div>
        )}
        {phase === 'member' && selectedMember && (
          <motion.div key="member" variants={fade} initial="initial" animate="animate" exit="exit">
            <MemberDetail
              member={selectedMember}
              go={go}
              onUpdateMood={updateMemberMood}
              onDelete={deleteMember}
              onUpdateNote={updateMemberNote}
            />
          </motion.div>
        )}
        {phase === 'compose' && (
          <motion.div key="compose" variants={fade} initial="initial" animate="animate" exit="exit">
            <SupportCompose target={composeTarget} members={members} go={go} />
          </motion.div>
        )}
        {phase === 'state' && (
          <motion.div key="state" variants={fade} initial="initial" animate="animate" exit="exit">
            <StateShare myState={myState} onUpdate={setMyState} go={go} />
          </motion.div>
        )}
        {phase === 'insights' && (
          <motion.div key="insights" variants={fade} initial="initial" animate="animate" exit="exit">
            <Insights members={members} go={go} />
          </motion.div>
        )}
        {phase === 'history' && (
          <motion.div key="history" variants={fade} initial="initial" animate="animate" exit="exit">
            <CheckHistory members={members} go={go} />
          </motion.div>
        )}
        {phase === 'add' && (
          <motion.div key="add" variants={fade} initial="initial" animate="animate" exit="exit">
            <AddMember onAdd={addMember} memberCount={members.length} go={go} />
          </motion.div>
        )}
        {phase === 'join' && (
          <motion.div key="join" variants={fade} initial="initial" animate="animate" exit="exit">
            <JoinCircle onJoin={data => { setSharedData(data); setPhase('shared'); }} go={go} />
          </motion.div>
        )}
        {phase === 'shared' && sharedData && (
          <motion.div key="shared" variants={fade} initial="initial" animate="animate" exit="exit">
            <SharedView circleData={sharedData} go={go} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
