/**
 * burnout-detector/App.jsx
 * Silent Burnout Detector — hackathon-ready developer wellness module.
 * Four tabs: Git Signals · Typing Monitor · Activity Log · Report
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, GitCommit, Keyboard, ClipboardList, BarChart2, ArrowLeft, AlertTriangle } from 'lucide-react';
import GitPanel from './components/GitPanel';
import TypingMonitor from './components/TypingMonitor';
import ActivityLogger from './components/ActivityLogger';
import BurnoutReport from './components/BurnoutReport';
import SignalTimeline from './components/SignalTimeline';
import {
  scoreGitSignals, scoreTypingSignals, scoreActivitySignals,
  computeOverallBurnout, riskLabel, BDStore,
} from './data/burnoutSignals';

const BLK = '1.5px solid #111';
const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const TABS = [
  { id: 'git',      label: 'Git Signals',     Icon: GitCommit,    shortLabel: 'Git' },
  { id: 'typing',   label: 'Typing Monitor',  Icon: Keyboard,     shortLabel: 'Typing' },
  { id: 'activity', label: 'Activity Log',    Icon: ClipboardList, shortLabel: 'Activity' },
  { id: 'timeline', label: 'Timeline',        Icon: BarChart2,    shortLabel: 'Timeline' },
  { id: 'report',   label: 'Burnout Report',  Icon: Flame,        shortLabel: 'Report' },
];

// Load initial scores from localStorage
function initScores() {
  const gitMeta      = BDStore.getGitMeta();
  const typingSamples = BDStore.getTypingSamples();
  const actLogs      = BDStore.getActivityLogs();

  const git      = gitMeta      ? scoreGitSignals([])      : { score: 0, detail: null };
  // For git we use stored detail (commits already processed)
  const gitScore = gitMeta ? (gitMeta.score ?? 0) : 0;

  const typing   = scoreTypingSignals(typingSamples);
  const activity = scoreActivitySignals(actLogs);
  const overall  = computeOverallBurnout(gitScore, typing.score, activity.score);

  return {
    gitScore,
    gitDetail:      gitMeta      || null,
    typingScore:    typing.score,
    typingDetail:   typing.detail || null,
    activityScore:  activity.score,
    activityDetail: { ...activity.detail, recentLogs: actLogs.slice(-7) } || null,
    overall,
  };
}

export default function BurnoutDetectorApp({ onBack }) {
  const [tab, setTab]       = useState('git');
  const [scores, setScores] = useState(initScores);

  const updateGit = useCallback((scored) => {
    setScores(prev => {
      const g = scored.score;
      const o = computeOverallBurnout(g, prev.typingScore, prev.activityScore);
      return { ...prev, gitScore: g, gitDetail: scored.detail, overall: o };
    });
  }, []);

  const updateTyping = useCallback((scored) => {
    setScores(prev => {
      const t = scored.score;
      const o = computeOverallBurnout(prev.gitScore, t, prev.activityScore);
      return { ...prev, typingScore: t, typingDetail: scored.detail, overall: o };
    });
  }, []);

  const updateActivity = useCallback((scored) => {
    setScores(prev => {
      const a = scored.score;
      const logs = BDStore.getActivityLogs().slice(-7);
      const o = computeOverallBurnout(prev.gitScore, prev.typingScore, a);
      return { ...prev, activityScore: a, activityDetail: { ...scored.detail, recentLogs: logs }, overall: o };
    });
  }, []);

  const risk = riskLabel(scores.overall);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf7f2', color: '#111' }}>

      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full" style={{ borderBottom: '3px solid #111', background: '#faf7f2' }}>

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2 text-[9px] font-mono text-black/40 uppercase tracking-widest"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
          <button onClick={onBack}
            className="flex items-center gap-1 hover:text-black transition-colors">
            <ArrowLeft size={10} /> Hub
          </button>
          <span>/</span>
          <span>Burnout Detector</span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame size={18} style={{ color: '#c2410c' }} />
              <h1 className="font-black text-2xl" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
                Silent Burnout Detector
              </h1>
            </div>
            <p className="text-[10px] font-mono text-black/45 mt-0.5 italic">
              Git commits · typing speed · activity patterns → real burnout signals
            </p>
          </div>

          {/* Composite score chip */}
          {scores.overall > 0 && (
            <div className="shrink-0 flex flex-col items-center px-3 py-2"
              style={{ border: '2px solid #111', background: risk.bg, boxShadow: '2px 2px 0 #111' }}>
              <span className="text-[8px] font-black font-mono uppercase tracking-wider" style={{ color: risk.color }}>
                Risk Score
              </span>
              <span className="text-2xl font-black" style={{ fontFamily: 'Georgia, serif', color: risk.color }}>
                {scores.overall}
              </span>
              <span className="text-[9px] font-black font-mono" style={{ color: risk.color }}>{risk.label}</span>
            </div>
          )}
        </div>

        {/* Risk banner (critical/high) */}
        {scores.overall >= 55 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-mono"
            style={{
              background: scores.overall >= 75 ? '#fef2f2' : '#fff7ed',
              color: scores.overall >= 75 ? '#991b1b' : '#9a3412',
              borderTop: `1px solid ${scores.overall >= 75 ? '#dc2626' : '#f97316'}`,
            }}>
            <AlertTriangle size={10} />
            {scores.overall >= 75
              ? 'CRITICAL — your behavioral patterns strongly suggest severe burnout. Please see the Report tab.'
              : 'HIGH RISK — multiple burnout signals detected. Consider reviewing your workload.'}
          </motion.div>
        )}
      </motion.header>

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto" style={{ borderBottom: '2px solid #111', background: '#fff' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-3 shrink-0 text-[10px] font-black font-mono uppercase tracking-wider transition-colors"
            style={{
              borderRight: '1px solid rgba(0,0,0,0.1)',
              background: tab === t.id ? '#111' : 'transparent',
              color: tab === t.id ? '#fff' : '#666',
            }}>
            <t.Icon size={11} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.shortLabel}</span>
            {/* Score badge on tab */}
            {t.id === 'git'      && scores.gitScore > 0      && (
              <span className="px-1 text-[8px]" style={{ background: riskLabel(scores.gitScore).color, color: '#fff' }}>{scores.gitScore}</span>
            )}
            {t.id === 'typing'   && scores.typingScore > 0   && (
              <span className="px-1 text-[8px]" style={{ background: riskLabel(scores.typingScore).color, color: '#fff' }}>{scores.typingScore}</span>
            )}
            {t.id === 'activity' && scores.activityScore > 0 && (
              <span className="px-1 text-[8px]" style={{ background: riskLabel(scores.activityScore).color, color: '#fff' }}>{scores.activityScore}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {tab === 'git' && (
            <motion.div key="git" {...fade} transition={{ duration: 0.25 }}>
              <GitPanel onScoreReady={updateGit} />
            </motion.div>
          )}
          {tab === 'typing' && (
            <motion.div key="typing" {...fade} transition={{ duration: 0.25 }}>
              <TypingMonitor onScoreReady={updateTyping} />
            </motion.div>
          )}
          {tab === 'activity' && (
            <motion.div key="activity" {...fade} transition={{ duration: 0.25 }}>
              <ActivityLogger onScoreReady={updateActivity} />
            </motion.div>
          )}
          {tab === 'timeline' && (
            <motion.div key="timeline" {...fade} transition={{ duration: 0.25 }}>
              <SignalTimeline />
            </motion.div>
          )}
          {tab === 'report' && (
            <motion.div key="report" {...fade} transition={{ duration: 0.25 }}>
              <BurnoutReport
                gitScore={scores.gitScore}
                typingScore={scores.typingScore}
                activityScore={scores.activityScore}
                overallScore={scores.overall}
                gitDetail={scores.gitDetail}
                typingDetail={scores.typingDetail}
                activityDetail={scores.activityDetail}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <footer className="w-full px-4 py-3 text-center text-[9px] font-mono text-black/30"
        style={{ borderTop: BLK, background: '#f0ede6' }}>
        Not a diagnostic tool. All behavioral data stays local in your browser. · MindTrace 2025
      </footer>
    </div>
  );
}
