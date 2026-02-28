import { useState, useEffect, useCallback } from 'react';
import NightlyDashboard from './components/NightlyDashboard';
import { getTodayLog, scoreLog } from './data/sleepStore';

export default function SleepGuardianApp({ onBack }) {
  const [log, setLog] = useState(() => getTodayLog());

  // Recompute score every 60s because score depends on current hour
  const [scored, setScored] = useState(() => scoreLog(getTodayLog()));

  const refresh = useCallback((nextLog) => {
    setScored(scoreLog(nextLog));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const latest = getTodayLog();
      setLog(latest);
      setScored(scoreLog(latest));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  function handleChange(nextLog) {
    setLog(nextLog);
    refresh(nextLog);
  }

  return (
    <div className="relative min-h-screen">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-5 left-5 z-20 font-mono text-indigo-400 hover:text-indigo-200 text-xs tracking-widest transition-colors flex items-center gap-1"
      >
        ← back
      </button>

      <NightlyDashboard
        log={log}
        score={scored.score}
        ghostState={scored.ghostState}
        onChange={handleChange}
      />
    </div>
  );
}
