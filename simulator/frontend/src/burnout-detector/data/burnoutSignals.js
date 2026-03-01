/**
 * burnoutSignals.js
 * Pure client-side scoring from real behavioral data.
 * Returns 0–100 per domain; 100 = maximum burnout risk.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────
const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

/** Hour (0–23) extracted from ISO date string */
const hour = (iso) => new Date(iso).getHours();
const dow  = (iso) => new Date(iso).getDay(); // 0=Sun 6=Sat

// Burnout-pattern keywords in commit messages
const BUG_RX  = /\b(fix|bug|hotfix|patch|revert|broke|error|crash|issue|wrong)\b/i;
const FEAT_RX = /\b(feat|feature|add|implement|build|create|new|refactor|improve)\b/i;

// ── Git Signals ───────────────────────────────────────────────────────────────
export function scoreGitSignals(commits) {
  if (!commits || commits.length === 0) return { score: 0, detail: {} };

  const n = commits.length;

  // Night commits (22:00–05:00)
  const nightCount   = commits.filter(c => { const h = hour(c.date); return h >= 22 || h < 5; }).length;
  const nightRatio   = nightCount / n;

  // Weekend commits
  const weekendCount = commits.filter(c => { const d = dow(c.date); return d === 0 || d === 6; }).length;
  const weekendRatio = weekendCount / n;

  // Commit message length (shorter → less care → burnout signal)
  const msgLengths   = commits.map(c => c.message.split('\n')[0].length);
  const avgMsgLength = msgLengths.reduce((a, b) => a + b, 0) / n;

  // Bug-fix ratio vs feature
  const bugFixes  = commits.filter(c => BUG_RX.test(c.message)).length;
  const features  = commits.filter(c => FEAT_RX.test(c.message)).length;
  const bugFixRatio = n > 0 ? bugFixes / n : 0;

  // Frequency trend: compare last 30d commits to 30–60d ago
  const now     = Date.now();
  const D30     = 30 * 86400_000;
  const recent  = commits.filter(c => now - new Date(c.date).getTime() < D30).length;
  const older   = commits.filter(c => {
    const age = now - new Date(c.date).getTime();
    return age >= D30 && age < D30 * 2;
  }).length;
  const frequencyTrend = older > 0 ? (recent - older) / older : 0; // negative = drop

  // Score components (each 0–1 where 1 = max burnout signal)
  const nightScore    = clamp(nightRatio * 2, 0, 1);           // >50% night = max
  const weekendScore  = clamp(weekendRatio * 1.5, 0, 1);       // >67% weekend = max
  const msgScore      = clamp(1 - avgMsgLength / 60, 0, 1);    // <10 chars = max
  const bugScore      = clamp(bugFixRatio * 1.8, 0, 1);        // >55% bug fixes = max
  const dropScore     = frequencyTrend < 0 ? clamp(-frequencyTrend, 0, 1) : 0;

  const rawScore = (nightScore * 30) + (weekendScore * 20) + (msgScore * 20) + (bugScore * 20) + (dropScore * 10);

  return {
    score: clamp(Math.round(rawScore)),
    detail: {
      nightCommitRatio: +nightRatio.toFixed(3),
      weekendRatio: +weekendRatio.toFixed(3),
      avgMsgLength: +avgMsgLength.toFixed(1),
      bugFixRatio: +bugFixRatio.toFixed(3),
      frequencyTrend: +frequencyTrend.toFixed(3),
      totalCommits: n,
      recentCommits: recent,
    },
    components: { nightScore, weekendScore, msgScore, bugScore, dropScore },
  };
}

// ── Typing Signals ────────────────────────────────────────────────────────────
/**
 * @param {Array<{wpm:number, backspaceRate:number, avgPauseMs:number, ts:number}>} samples
 */
export function scoreTypingSignals(samples) {
  if (!samples || samples.length < 2) return { score: 0, detail: {} };

  const wpms = samples.map(s => s.wpm).filter(Boolean);
  const bprs = samples.map(s => s.backspaceRate).filter(v => v != null);
  const pauseMs = samples.map(s => s.avgPauseMs).filter(Boolean);

  const avgWpm      = wpms.reduce((a, b) => a + b, 0) / (wpms.length || 1);
  const backspaceRate = bprs.reduce((a, b) => a + b, 0) / (bprs.length || 1);
  const avgPause    = pauseMs.reduce((a, b) => a + b, 0) / (pauseMs.length || 1);

  // WPM trend: first half vs second half
  const half = Math.floor(wpms.length / 2);
  const earlyWpm = wpms.slice(0, half).reduce((a, b) => a + b, 0) / (half || 1);
  const lateWpm  = wpms.slice(half).reduce((a, b) => a + b, 0) / (wpms.length - half || 1);
  const wpmDrop  = earlyWpm > 0 ? (earlyWpm - lateWpm) / earlyWpm : 0; // positive = drop

  // Score components
  const wpmScore      = avgWpm < 20 ? 1 : clamp(1 - (avgWpm - 20) / 80, 0, 1); // <20 wpm → max risk
  const wpmDropScore  = clamp(wpmDrop * 2, 0, 1);
  const errorScore    = clamp(backspaceRate, 0, 1);
  const pauseScore    = avgPause > 5000 ? 1 : clamp(avgPause / 5000, 0, 1);     // >5s avg pause = max

  const rawScore = (wpmScore * 30) + (wpmDropScore * 25) + (errorScore * 25) + (pauseScore * 20);

  return {
    score: clamp(Math.round(rawScore)),
    detail: {
      avgWpm: +avgWpm.toFixed(1),
      wpmTrend: wpmDrop > 0.05 ? 'declining' : wpmDrop < -0.05 ? 'improving' : 'stable',
      backspaceRate: +backspaceRate.toFixed(3),
      avgPauseMs: +avgPause.toFixed(0),
      sessions: samples.length,
    },
  };
}

// ── Activity Log Signals ──────────────────────────────────────────────────────
/**
 * @param {Array<{date, mood:1-5, focus:1-5, hoursWorked, meetings, breaks, overtime}>} logs
 */
export function scoreActivitySignals(logs) {
  if (!logs || logs.length === 0) return { score: 0, detail: {} };

  const n = logs.length;
  const avg = (key) => logs.reduce((s, l) => s + (l[key] || 0), 0) / n;

  const avgMood      = avg('mood');
  const avgFocus     = avg('focus');
  const avgHours     = avg('hoursWorked');
  const avgMeetings  = avg('meetings');
  const avgBreaks    = avg('breaks');
  const avgOvertime  = avg('overtime');

  // Score components (higher = more burnout signal)
  const moodScore     = clamp(1 - (avgMood - 1) / 4, 0, 1);     // mood=1 → score=1
  const focusScore    = clamp(1 - (avgFocus - 1) / 4, 0, 1);
  const hoursScore    = avgHours > 8 ? clamp((avgHours - 8) / 4, 0, 1) : 0;  // >12h max
  const meetingScore  = avgMeetings > 4 ? clamp((avgMeetings - 4) / 4, 0, 1) : 0;
  const breakPenalty  = avgBreaks < 1 ? 1 : clamp(1 - avgBreaks / 3, 0, 1);
  const overtimeScore = clamp(avgOvertime / 3, 0, 1);            // 3h+ overtime = max

  const rawScore = (moodScore * 30) + (focusScore * 20) + (hoursScore * 15) +
                  (meetingScore * 15) + (breakPenalty * 10) + (overtimeScore * 10);

  return {
    score: clamp(Math.round(rawScore)),
    detail: {
      avgMood: +avgMood.toFixed(2),
      avgFocus: +avgFocus.toFixed(2),
      avgHours: +avgHours.toFixed(1),
      avgMeetings: +avgMeetings.toFixed(1),
      avgBreaks: +avgBreaks.toFixed(1),
      avgOvertime: +avgOvertime.toFixed(1),
    },
  };
}

// ── Composite Score ───────────────────────────────────────────────────────────
export function computeOverallBurnout(gitScore, typingScore, activityScore) {
  // Weights: activity > git > typing
  const weights = [
    [gitScore,      0.35],
    [typingScore,   0.20],
    [activityScore, 0.45],
  ].filter(([s]) => s > 0);

  if (weights.length === 0) return 0;
  const totalW = weights.reduce((s, [, w]) => s + w, 0);
  const weighted = weights.reduce((s, [score, w]) => s + score * w, 0);
  return clamp(Math.round(weighted / totalW));
}

export function riskLabel(score) {
  if (score >= 75) return { label: 'Critical', color: '#dc2626', bg: '#fef2f2' };
  if (score >= 55) return { label: 'High',     color: '#ea580c', bg: '#fff7ed' };
  if (score >= 35) return { label: 'Moderate', color: '#d97706', bg: '#fefce8' };
  return              { label: 'Low',      color: '#16a34a', bg: '#f0fdf4' };
}

// ── LocalStorage persistence helpers ─────────────────────────────────────────
const STORAGE_KEYS = {
  typing:   'bd_typing_samples',
  activity: 'bd_activity_logs',
  git:      'bd_git_meta',
};

export const BDStore = {
  getTypingSamples: ()    => JSON.parse(localStorage.getItem(STORAGE_KEYS.typing)  || '[]'),
  saveTypingSample: (s)   => {
    const samples = BDStore.getTypingSamples();
    samples.push({ ...s, ts: Date.now() });
    // Keep last 50 samples
    localStorage.setItem(STORAGE_KEYS.typing, JSON.stringify(samples.slice(-50)));
  },
  clearTyping: ()         => localStorage.removeItem(STORAGE_KEYS.typing),

  getActivityLogs: ()     => JSON.parse(localStorage.getItem(STORAGE_KEYS.activity) || '[]'),
  saveActivityLog: (l)    => {
    const logs = BDStore.getActivityLogs();
    // Replace today's log if exists, else append
    const today = new Date().toISOString().slice(0, 10);
    const idx = logs.findIndex(x => x.date === today);
    if (idx >= 0) logs[idx] = l; else logs.push(l);
    localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(logs.slice(-30)));
  },
  clearActivity: ()       => localStorage.removeItem(STORAGE_KEYS.activity),

  getGitMeta: ()          => JSON.parse(localStorage.getItem(STORAGE_KEYS.git) || 'null'),
  saveGitMeta: (m)        => localStorage.setItem(STORAGE_KEYS.git, JSON.stringify(m)),
};
