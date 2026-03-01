/**
 * SignalTimeline.jsx
 * 30-day multi-signal timeline: git patterns, typing speed, activity logs.
 * All data from localStorage — no mocks.
 */
import { useMemo } from 'react';
import { BDStore, riskLabel } from '../data/burnoutSignals';

const BLK = '1.5px solid #111';

function dayKey(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default function SignalTimeline() {
  const activityLogs   = BDStore.getActivityLogs();
  const typingSamples  = BDStore.getTypingSamples();
  const gitMeta        = BDStore.getGitMeta();

  // Last 30 days
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => dayKey(29 - i)), []);

  const activityMap = useMemo(() =>
    Object.fromEntries(activityLogs.map(l => [l.date, l])), [activityLogs]);

  // Group typing samples by day
  const typingByDay = useMemo(() => {
    const map = {};
    typingSamples.forEach(s => {
      const d = new Date(s.ts).toISOString().slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(s.wpm);
    });
    return map;
  }, [typingSamples]);

  const moodColor = (val) => {
    if (!val) return '#e5e7eb';
    if (val <= 2) return '#dc2626';
    if (val <= 3) return '#f97316';
    if (val <= 4) return '#eab308';
    return '#22c55e';
  };

  const wpmColor = (wpms) => {
    if (!wpms?.length) return '#e5e7eb';
    const avg = wpms.reduce((a, b) => a + b, 0) / wpms.length;
    if (avg < 20) return '#dc2626';
    if (avg < 35) return '#f97316';
    if (avg < 60) return '#eab308';
    return '#22c55e';
  };

  const hoursColor = (h) => {
    if (!h) return '#e5e7eb';
    if (h > 12) return '#dc2626';
    if (h > 10) return '#f97316';
    if (h > 9)  return '#eab308';
    return '#22c55e';
  };

  const rows = [
    {
      label: 'Mood',
      cells: days.map(d => ({
        color: moodColor(activityMap[d]?.mood),
        title: activityMap[d] ? `${d} · mood ${activityMap[d].mood}/5` : `${d} · no data`,
        empty: !activityMap[d],
      })),
    },
    {
      label: 'Focus',
      cells: days.map(d => ({
        color: moodColor(activityMap[d]?.focus),
        title: activityMap[d] ? `${d} · focus ${activityMap[d].focus}/5` : `${d} · no data`,
        empty: !activityMap[d],
      })),
    },
    {
      label: 'Hours',
      cells: days.map(d => ({
        color: hoursColor(activityMap[d]?.hoursWorked),
        title: activityMap[d] ? `${d} · ${activityMap[d].hoursWorked}h worked` : `${d} · no data`,
        empty: !activityMap[d],
      })),
    },
    {
      label: 'Typing',
      cells: days.map(d => ({
        color: wpmColor(typingByDay[d]),
        title: typingByDay[d] ? `${d} · avg ${Math.round(typingByDay[d].reduce((a,b)=>a+b,0)/typingByDay[d].length)} WPM` : `${d} · no data`,
        empty: !typingByDay[d],
      })),
    },
  ];

  const hasAnyData = activityLogs.length > 0 || typingSamples.length > 0;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Git metadata card ── */}
      {gitMeta && (
        <div className="p-4" style={{ border: BLK, background: '#fff', boxShadow: '2px 2px 0 #111' }}>
          <p className="text-[9px] font-black font-mono uppercase tracking-widest text-black/40 mb-3">
            Last Git Scan — {gitMeta.owner}/{gitMeta.repo}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Night commits', val: `${((gitMeta.nightCommitRatio||0)*100).toFixed(0)}%`, bad: gitMeta.nightCommitRatio > 0.3 },
              { label: 'Bug-fix ratio', val: `${((gitMeta.bugFixRatio||0)*100).toFixed(0)}%`, bad: gitMeta.bugFixRatio > 0.4 },
              { label: 'Freq trend', val: `${gitMeta.frequencyTrend > 0 ? '+' : ''}${((gitMeta.frequencyTrend||0)*100).toFixed(0)}%`, bad: gitMeta.frequencyTrend < -0.2 },
              { label: 'Avg msg len', val: `${gitMeta.avgMsgLength} ch`, bad: gitMeta.avgMsgLength < 20 },
              { label: 'Total commits', val: gitMeta.totalCommits, bad: false },
              { label: 'Weekend commits', val: `${((gitMeta.weekendRatio||0)*100).toFixed(0)}%`, bad: gitMeta.weekendRatio > 0.35 },
            ].map(s => (
              <div key={s.label} className="p-2" style={{ border: BLK, background: s.bad ? '#fff7ed' : '#fafafa' }}>
                <p className="text-[8px] font-mono text-black/40">{s.label}</p>
                <p className="text-sm font-black font-mono" style={{ color: s.bad ? '#dc2626' : '#111' }}>{s.val}</p>
              </div>
            ))}
          </div>
          <p className="text-[8px] font-mono text-black/30 mt-2">
            Scanned {new Date(gitMeta.fetchedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* ── Multi-row heatmap ── */}
      {hasAnyData ? (
        <div style={{ border: BLK, background: '#fff' }}>
          <div className="px-3 py-2" style={{ borderBottom: BLK, background: '#f8f8f8' }}>
            <span className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50">
              30-Day Signal Timeline
            </span>
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="flex flex-col gap-2 min-w-[480px]">
              {rows.map(row => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="text-[9px] font-black font-mono w-12 shrink-0 text-black/50">{row.label}</span>
                  <div className="flex gap-0.5 flex-1">
                    {row.cells.map((cell, i) => (
                      <div key={i} title={cell.title}
                        className="flex-1 rounded-sm"
                        style={{
                          height: 16,
                          background: cell.color,
                          opacity: cell.empty ? 0.2 : 1,
                        }} />
                    ))}
                  </div>
                </div>
              ))}
              {/* Day labels */}
              <div className="flex items-center gap-2 mt-1">
                <span className="w-12 shrink-0" />
                <div className="flex flex-1 justify-between text-[7px] font-mono text-black/30">
                  <span>30d ago</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 pb-3 flex gap-3 flex-wrap">
            {[
              { color: '#22c55e', label: 'Good' },
              { color: '#eab308', label: 'Watch' },
              { color: '#f97316', label: 'Risk' },
              { color: '#dc2626', label: 'Alert' },
              { color: '#e5e7eb', label: 'No data' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1 text-[8px] font-mono text-black/50">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center" style={{ border: BLK, background: '#fafafa' }}>
          <p className="text-[11px] font-mono text-black/40">
            No data yet — connect your GitHub repo, run a typing session, or log some activity.
          </p>
        </div>
      )}

      {/* ── Quick stats row ── */}
      {hasAnyData && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3" style={{ border: BLK, background: '#fff' }}>
            <p className="text-[8px] font-mono text-black/40 mb-1">Activity Days Logged</p>
            <p className="text-2xl font-black font-mono">{activityLogs.length}</p>
          </div>
          <div className="p-3" style={{ border: BLK, background: '#fff' }}>
            <p className="text-[8px] font-mono text-black/40 mb-1">Typing Sessions</p>
            <p className="text-2xl font-black font-mono">{typingSamples.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
