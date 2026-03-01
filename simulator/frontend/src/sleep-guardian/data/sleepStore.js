/**
 * sleepStore.js
 * Persists sleep log data in localStorage. One record per calendar day.
 */

const KEY = 'mindtrace_sleep_logs';

export function todayKey() {
  return new Date().toISOString().slice(0, 10); // "2026-03-01"
}

export function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveLogs(logs) {
  localStorage.setItem(KEY, JSON.stringify(logs));
}

/** Returns today's log, creating defaults if absent */
export function getTodayLog() {
  const logs = loadLogs();
  if (!logs[todayKey()]) {
    logs[todayKey()] = defaultLog();
    saveLogs(logs);
  }
  return logs[todayKey()];
}

export function updateTodayLog(patch) {
  const logs  = loadLogs();
  const today = todayKey();
  logs[today] = { ...(logs[today] ?? defaultLog()), ...patch, updatedAt: Date.now() };
  saveLogs(logs);
  return logs[today];
}

/**
 * Internal base scorer — no streak bonus. Used by getStreak() to avoid
 * circular recursion (scoreLog → getStreak → scoreLog → …).
 */
function _baseScore(log) {
  let score = 100;
  const now  = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  // ── Laptop session duration penalty ───────────────────────────────────────
  if (log.laptopSessionStart) {
    const [lh, lm] = log.laptopSessionStart.split(':').map(Number);
    const startHour = lh + lm / 60;
    const duration  = hour >= startHour ? hour - startHour : 24 - startHour + hour;
    if (duration >= 10) score -= 15;
    else if (duration >= 7) score -= 8;
  }

  // Late screen time penalty
  if (hour >= 23)              score -= 20;
  if (hour >= 0 && hour < 4)   score -= 35;
  else if (hour >= 22)         score -= 8;

  // Caffeine timing penalty
  if (log.caffeineTime) {
    const [ch, cm] = log.caffeineTime.split(':').map(Number);
    const caffeineHour = ch + cm / 60;
    const hoursSinceCaffeine = hour >= caffeineHour
      ? hour - caffeineHour
      : 24 - caffeineHour + hour;
    if (hoursSinceCaffeine < 4)  score -= 30;
    else if (hoursSinceCaffeine < 6) score -= 18;
    else if (hoursSinceCaffeine < 9) score -= 8;
  }

  // Bedtime goal
  if (log.targetBedtime) {
    const [bh, bm] = log.targetBedtime.split(':').map(Number);
    const bedHour = bh + bm / 60;
    if (hour > bedHour + 1) score -= 15;
  } else {
    score -= 5;
  }

  // Bad habit penalties
  if (log.lateSnack)    score -= 8;
  if (log.alcohol)      score -= 12;
  if (log.bingeWatch)   score -= 10;
  if (log.highStress)   score -= 9;
  if (log.lateExercise) score -= 7;
  if (log.lateNap)      score -= 8;
  if (log.gaming)       score -= 9;
  if (log.socialScroll) score -= 10;
  if (log.blueLight)    score -= 6;

  // Bonuses
  if (log.phoneDowntime) score += 10;
  if (log.earlyDim)      score += 5;

  return Math.max(0, Math.min(100, score));
}

/** Build score 0-100 + ghost state from a log (includes streak bonus) */
export function scoreLog(log) {
  let score = _baseScore(log);

  // Streak bonus (up to +15) — uses _baseScore internally to avoid circular call
  const streak = getStreak();
  score = Math.max(0, Math.min(100, score + Math.min(streak * 3, 15)));

  const ghostState =
    score >= 72 ? 'fresh'
    : score >= 45 ? 'tired'
    : 'exhausted';

  return { score, ghostState };
}

/**
 * Returns auto-detected laptop status based on current time
 * and stored session start time.
 */
export function laptopStatus() {
  const now  = new Date();
  const h    = now.getHours();
  const hour = h + now.getMinutes() / 60;
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const log = getTodayLog();
  let durationText = '';
  if (log.laptopSessionStart) {
    const [lh, lm] = log.laptopSessionStart.split(':').map(Number);
    const startHour = lh + lm / 60;
    const duration  = hour >= startHour ? hour - startHour : 24 - startHour + hour;
    const hrs  = Math.floor(duration);
    const mins = Math.round((duration - hrs) * 60);
    if (hrs > 0) durationText = `${hrs}h ${mins}m session`;
    else if (mins > 0) durationText = `${mins}m session`;
  }

  let severity = 'ok';       // ok | warn | danger
  let message  = `Active since ${log.laptopSessionStart ?? '?'}`;
  if (h >= 23 || h < 4) {
    severity = 'danger';
    message  = `Still on the laptop at ${timeStr} 😵`;
  } else if (h >= 21) {
    severity = 'warn';
    message  = `Late screen time — ${timeStr} 🌙`;
  } else if (h >= 20) {
    severity = 'warn';
    message  = `Getting close to wind-down time`;
  }

  return { timeStr, durationText, severity, message, hour: h };
}

/** Caffeine level 0-100 (how much caffeine is still active in system) */
export function caffeineLevel(log) {
  if (!log.caffeineTime) return 0;
  const now  = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const [ch, cm] = log.caffeineTime.split(':').map(Number);
  const caffeineHour = ch + cm / 60;
  const hoursSince = hour >= caffeineHour
    ? hour - caffeineHour
    : 24 - caffeineHour + hour;

  // Caffeine half-life ~5-6h; model level decay
  const halfLife = 5.5;
  const level = 100 * Math.pow(0.5, hoursSince / halfLife);
  return Math.round(Math.min(100, level));
}

/** Count of cookies (moon cookies) earned based on history + completed challenges */
export function moonCookies() {
  const logs  = loadLogs();
  let cookies = 0;
  Object.values(logs).forEach(log => {
    const { score } = scoreLog(log);
    if (score >= 72) cookies += 3;
    else if (score >= 50) cookies += 1;
    cookies += (log.challengeCookies ?? 0);
  });
  return Math.min(cookies, 99);
}

/** Get completed challenge ids for today */
export function getTodayChallenges() {
  return getTodayLog().completedChallenges ?? [];
}

/** Mark a challenge as complete and award bonus cookies */
export function completeChallenge(id, reward = 5) {
  const log = getTodayLog();
  const already = (log.completedChallenges ?? []).includes(id);
  if (already) return log;
  const next = updateTodayLog({
    completedChallenges: [...(log.completedChallenges ?? []), id],
    challengeCookies: (log.challengeCookies ?? 0) + reward,
  });
  return next;
}

/** Consecutive good nights streak — uses _baseScore to avoid circular call */
export function getStreak() {
  const logs = loadLogs();
  let streak = 0;
  const d = new Date();
  for (let i = 1; i <= 30; i++) {
    d.setDate(d.getDate() - 1);
    const key = d.toISOString().slice(0, 10);
    if (!logs[key]) break;
    const score = _baseScore(logs[key]);
    if (score >= 60) streak++;
    else break;
  }
  return streak;
}

function defaultLog() {
  // Capture session start as HH:MM when the day's record is first created
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  return {
    caffeineTime:       '',
    caffeineType:       'coffee',
    targetBedtime:      '23:00',
    laptopSessionStart: `${hh}:${mm}`,  // auto-detected: time module first opened
    // toggle bad habits
    phoneDowntime:  false,
    lateSnack:      false,   // 🍕 ate within 2h of bedtime
    alcohol:        false,   // 🍷 drank alcohol today
    bingeWatch:     false,   // 📺 streamed >2h in evening
    highStress:     false,   // 😰 high stress/anxiety today
    lateExercise:   false,   // 🏃 intense exercise within 3h of bed
    lateNap:        false,   // 💤 napped after 3 PM
    gaming:         false,   // 🎮 gaming before bed
    socialScroll:   false,   // 📱 social media scrolling in bed
    blueLight:      false,   // 💡 no blue-light filter on screen
    earlyDim:       false,   // 🌅 dimmed screen early (bonus)
    notes:              '',
    completedChallenges: [],   // string[] — challenge ids done today
    challengeCookies:    0,    // bonus moon cookies from challenges
    createdAt:           Date.now(),
    updatedAt:           Date.now(),
  };
}

export const CAFFEINE_TYPES = [
  { key: 'espresso',  label: 'Espresso',     mg: 63,  icon: '☕' },
  { key: 'coffee',    label: 'Filter Coffee', mg: 95,  icon: '☕' },
  { key: 'tea',       label: 'Tea',           mg: 47,  icon: '🍵' },
  { key: 'matcha',    label: 'Matcha',        mg: 70,  icon: '🍵' },
  { key: 'energy',    label: 'Energy Drink',  mg: 160, icon: '⚡' },
  { key: 'cola',      label: 'Cola',          mg: 35,  icon: '🥤' },
];
