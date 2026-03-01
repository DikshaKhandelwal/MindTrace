/**
 * GitPanel.jsx
 * Connects to a real GitHub repository, fetches commits, displays analysis.
 * No mock data — all live from GitHub REST API v3 via backend proxy.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCommit, Lock, Unlock, TrendingDown, TrendingUp, Moon, Sun, Bug, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { scoreGitSignals, BDStore } from '../data/burnoutSignals';

const API = 'http://localhost:3001/api/burnout';
const BLK = '1.5px solid #111';

// ── Commit-type badge ─────────────────────────────────────────────────────────
const BUG_RX  = /\b(fix|bug|hotfix|patch|revert|broke|error|crash)\b/i;
const FEAT_RX = /\b(feat|feature|add|implement|build|create|new)\b/i;
function CommitTypeBadge({ message }) {
  if (BUG_RX.test(message))  return <span className="px-1.5 py-0.5 text-[9px] font-black font-mono" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #dc2626' }}>BUG</span>;
  if (FEAT_RX.test(message)) return <span className="px-1.5 py-0.5 text-[9px] font-black font-mono" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #16a34a' }}>FEAT</span>;
  return <span className="px-1.5 py-0.5 text-[9px] font-black font-mono" style={{ background: '#f8f8f8', color: '#666', border: '1px solid #ccc' }}>CHORE</span>;
}

// ── Hour heatmap bar ──────────────────────────────────────────────────────────
function HourBar({ commits }) {
  const counts = Array(24).fill(0);
  commits.forEach(c => counts[new Date(c.date).getHours()]++);
  const max = Math.max(...counts, 1);
  return (
    <div>
      <p className="text-[9px] font-black font-mono uppercase tracking-widest text-black/40 mb-2">
        Commit Time Distribution (24h)
      </p>
      <div className="flex items-end gap-0.5 h-10">
        {counts.map((v, i) => {
          const isNight = i >= 22 || i < 5;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full transition-all"
                style={{
                  height: `${Math.max(2, (v / max) * 36)}px`,
                  background: isNight ? '#ef4444' : '#3b82f6',
                  opacity: v === 0 ? 0.15 : 1
                }} />
              {(i % 6 === 0) && (
                <span className="text-[7px] font-mono text-black/30">{i}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-1.5">
        <span className="flex items-center gap-1 text-[9px] font-mono text-black/50">
          <span className="w-2 h-2 inline-block" style={{ background: '#ef4444' }} />
          Night (22–05)
        </span>
        <span className="flex items-center gap-1 text-[9px] font-mono text-black/50">
          <span className="w-2 h-2 inline-block" style={{ background: '#3b82f6' }} />
          Day
        </span>
      </div>
    </div>
  );
}

// ── Weekly frequency sparkline ────────────────────────────────────────────────
function WeeklyBar({ weeklyFreq }) {
  if (!weeklyFreq?.length) return null;
  const max = Math.max(...weeklyFreq.map(w => w.total), 1);
  const recent4  = weeklyFreq.slice(-4).reduce((s, w) => s + w.total, 0);
  const prev4    = weeklyFreq.slice(-8, -4).reduce((s, w) => s + w.total, 0);
  const trend    = prev4 > 0 ? ((recent4 - prev4) / prev4 * 100).toFixed(0) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-black font-mono uppercase tracking-widest text-black/40">
          Weekly Frequency (12w)
        </p>
        {trend !== null && (
          <span className="flex items-center gap-1 text-[10px] font-black font-mono"
            style={{ color: trend < 0 ? '#dc2626' : '#16a34a' }}>
            {trend < 0 ? <TrendingDown size={11}/> : <TrendingUp size={11}/>} {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="flex items-end gap-1 h-8">
        {weeklyFreq.map((w, i) => (
          <div key={i} className="flex-1"
            style={{
              height: `${Math.max(2, (w.total / max) * 28)}px`,
              background: i >= weeklyFreq.length - 4 ? '#f97316' : '#94a3b8',
              opacity: w.total === 0 ? 0.2 : 1,
            }} />
        ))}
      </div>
      <p className="text-[8px] font-mono text-black/30 mt-1">
        Orange = last 4 weeks · Grey = prior 8 weeks
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GitPanel({ onScoreReady }) {
  const [owner, setOwner]       = useState('');
  const [repo, setRepo]         = useState('');
  const [token, setToken]       = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [data, setData]         = useState(null);   // { commits, weeklyFreq }
  const [repoInfo, setRepoInfo] = useState(null);
  const [result, setResult]     = useState(null);   // scored output

  const fetch90days = callback => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString();
  };

  const handleFetch = useCallback(async () => {
    if (!owner.trim() || !repo.trim()) { setError('Enter owner and repo name'); return; }
    setLoading(true); setError(null); setData(null); setResult(null);

    try {
      const [commitsResp, repoResp] = await Promise.all([
        fetch(`${API}/github/commits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ owner: owner.trim(), repo: repo.trim(), token: token.trim() || undefined, since: fetch90days() }),
        }),
        fetch(`${API}/github/repo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ owner: owner.trim(), repo: repo.trim(), token: token.trim() || undefined }),
        }),
      ]);

      const commitsData = await commitsResp.json();
      if (!commitsResp.ok) throw new Error(commitsData.error || 'GitHub API error');

      const repoData = repoResp.ok ? await repoResp.json() : null;
      setData(commitsData);
      setRepoInfo(repoData);

      const scored = scoreGitSignals(commitsData.commits);
      setResult(scored);
      BDStore.saveGitMeta({ owner: owner.trim(), repo: repo.trim(), ...scored.detail, fetchedAt: Date.now() });
      onScoreReady?.(scored);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, token, onScoreReady]);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Connection form ── */}
      <div className="p-4" style={{ background: '#fff', border: BLK, boxShadow: '2px 2px 0 #111' }}>
        <div className="flex items-center gap-2 mb-3">
          <GitCommit size={14} />
          <span className="text-xs font-black font-mono uppercase tracking-wider">Connect Repository</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[9px] font-black font-mono uppercase tracking-wider text-black/50 block mb-1">
              GitHub Owner / Org
            </label>
            <input value={owner} onChange={e => setOwner(e.target.value)}
              placeholder="e.g. torvalds"
              className="w-full px-2 py-1.5 text-xs font-mono bg-white focus:outline-none"
              style={{ border: BLK }} />
          </div>
          <div>
            <label className="text-[9px] font-black font-mono uppercase tracking-wider text-black/50 block mb-1">
              Repository Name
            </label>
            <input value={repo} onChange={e => setRepo(e.target.value)}
              placeholder="e.g. linux"
              className="w-full px-2 py-1.5 text-xs font-mono bg-white focus:outline-none"
              style={{ border: BLK }} />
          </div>
        </div>

        {/* Optional PAT for private repos */}
        <div className="mb-3">
          <label className="text-[9px] font-black font-mono uppercase tracking-wider text-black/50 block mb-1">
            Personal Access Token <span className="font-normal normal-case">(optional — needed for private repos)</span>
          </label>
          <div className="flex">
            <input value={token} onChange={e => setToken(e.target.value)}
              type={showToken ? 'text' : 'password'}
              placeholder="ghp_xxxxxxxxxxxx"
              className="flex-1 px-2 py-1.5 text-xs font-mono bg-white focus:outline-none"
              style={{ border: BLK, borderRight: 'none' }} />
            <button onClick={() => setShowToken(s => !s)}
              className="px-2 py-1.5"
              style={{ border: BLK, background: '#f8f8f8' }}>
              {showToken ? <Unlock size={11} /> : <Lock size={11} />}
            </button>
          </div>
          <p className="text-[9px] font-mono text-black/35 mt-1">
            Token stays local — sent only to your own backend proxy.
          </p>
        </div>

        <button onClick={handleFetch} disabled={loading}
          className="w-full py-2 text-[11px] font-black font-mono uppercase tracking-widest transition-all"
          style={{ border: BLK, background: loading ? '#f0f0f0' : '#111', color: loading ? '#999' : '#fff' }}>
          {loading ? 'Fetching commits…' : 'Fetch & Analyze →'}
        </button>

        {error && (
          <div className="mt-2 flex items-center gap-2 p-2 text-[11px] font-mono"
            style={{ background: '#fef2f2', border: '1px solid #dc2626', color: '#dc2626' }}>
            <AlertTriangle size={11} /> {error}
          </div>
        )}
      </div>

      {/* ── Repo metadata ── */}
      {repoInfo && (
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Language', val: repoInfo.language || 'N/A' },
            { label: 'Open Issues', val: repoInfo.openIssues },
            { label: 'Stars', val: repoInfo.stars?.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="px-3 py-1.5 text-[10px] font-mono"
              style={{ border: BLK, background: '#fffdf5' }}>
              <span className="text-black/40">{s.label}: </span>
              <span className="font-black">{s.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Results ── */}
      <AnimatePresence>
        {data && result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">

            {/* Score pill */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: result.score > 60 ? '#fef2f2' : result.score > 35 ? '#fff7ed' : '#f0fdf4', border: BLK }}>
              <div>
                <p className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50">Git Burnout Signal</p>
                <p className="text-3xl font-black" style={{ fontFamily: 'Georgia, serif' }}>{result.score}<span className="text-base">/100</span></p>
              </div>
              <div className="text-right text-[10px] font-mono">
                <div className="flex items-center gap-1.5 mb-1">
                  <Moon size={10} className="text-red-500" />
                  <span>Night commits: <strong>{(result.detail.nightCommitRatio * 100).toFixed(0)}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Bug size={10} className="text-orange-500" />
                  <span>Bug fixes: <strong>{(result.detail.bugFixRatio * 100).toFixed(0)}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  {result.detail.frequencyTrend < -0.1
                    ? <TrendingDown size={10} className="text-red-500" />
                    : <TrendingUp size={10} className="text-green-600" />}
                  <span>Frequency: <strong>{result.detail.frequencyTrend > 0 ? '+' : ''}{(result.detail.frequencyTrend * 100).toFixed(0)}%</strong></span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="p-4 flex flex-col gap-5" style={{ background: '#fff', border: BLK }}>
              <HourBar commits={data.commits} />
              {data.weeklyFreq && <WeeklyBar weeklyFreq={data.weeklyFreq} />}
            </div>

            {/* Recent commits list */}
            <div style={{ border: BLK }}>
              <div className="px-3 py-2 flex items-center justify-between"
                style={{ borderBottom: BLK, background: '#f8f8f8' }}>
                <span className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50">
                  Latest Commits ({data.commits.length} total in 90 days)
                </span>
              </div>
              {data.commits.slice(0, 8).map(c => (
                <div key={c.sha} className="px-3 py-2 flex items-start gap-2"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <CommitTypeBadge message={c.message} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-black/80 truncate">{c.message.split('\n')[0]}</p>
                    <p className="text-[9px] font-mono text-black/35">
                      {new Date(c.date).toLocaleString()} · {c.author}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-black/30 shrink-0">{c.sha}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
