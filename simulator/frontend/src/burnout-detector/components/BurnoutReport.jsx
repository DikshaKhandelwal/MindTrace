/**
 * BurnoutReport.jsx
 * Calls backend GPT-4o-mini with real aggregated signals.
 * Renders the full burnout assessment with score, narrative, and action plan.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, ArrowRight, Heart, Zap, RefreshCw } from 'lucide-react';
import { riskLabel } from '../data/burnoutSignals';

const API = `${import.meta.env.VITE_API_URL || ''}/api/burnout`;
const BLK = '1.5px solid #111';

// ── Score donut ───────────────────────────────────────────────────────────────
function ScoreDonut({ score }) {
  const R = 52, CX = 60, CY = 60;
  const circ = 2 * Math.PI * R;
  const used = circ * (score / 100);
  const risk = riskLabel(score);

  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth={12} />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={risk.color} strokeWidth={12}
        strokeDasharray={`${used} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`} />
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize={26} fontWeight={900}
        fontFamily="Georgia, serif" fill="#111">{score}</text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontSize={9} fontWeight={700}
        fill={risk.color} fontFamily="monospace">{risk.label.toUpperCase()}</text>
    </svg>
  );
}

// ── Signal pill ───────────────────────────────────────────────────────────────
function SignalPill({ text, variant = 'warn' }) {
  const styles = {
    warn:  { bg: '#fff7ed', border: '#f97316', color: '#9a3412' },
    crit:  { bg: '#fef2f2', border: '#dc2626', color: '#991b1b' },
    ok:    { bg: '#f0fdf4', border: '#22c55e', color: '#166534' },
  };
  const s = styles[variant];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono mr-1.5 mb-1.5"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {text}
    </span>
  );
}

// ── Priority badge ────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    immediate:   { bg: '#fef2f2', color: '#dc2626', label: 'NOW' },
    'short-term':{ bg: '#fff7ed', color: '#f97316', label: 'SOON' },
    'long-term': { bg: '#f0fdf4', color: '#16a34a', label: 'LATER' },
  };
  const s = map[priority] || map['long-term'];
  return (
    <span className="px-1.5 py-0.5 text-[9px] font-black font-mono shrink-0"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}` }}>
      {s.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BurnoutReport({ gitScore, typingScore, activityScore, overallScore, gitDetail, typingDetail, activityDetail }) {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const hasData = overallScore > 0 || gitDetail || typingDetail || activityDetail;

  const generateReport = async () => {
    setLoading(true); setError(null);

    try {
      const resp = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gitMetrics:     gitDetail     || {},
          typingMetrics:  typingDetail  || {},
          activityLog:    activityDetail?.recentLogs || [],
          localScore:     overallScore,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Analysis failed');
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const risk = riskLabel(report?.burnoutScore ?? overallScore);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Score summary (always visible) ── */}
      <div className="p-4 flex items-center gap-6" style={{ background: '#fff', border: BLK, boxShadow: '2px 2px 0 #111' }}>
        <ScoreDonut score={report?.burnoutScore ?? overallScore} />
        <div className="flex-1">
          <p className="text-[10px] font-black font-mono uppercase tracking-wider text-black/40 mb-1">
            Overall Burnout Signal
          </p>
          {report?.headline ? (
            <p className="text-sm font-black" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.4 }}>
              "{report.headline}"
            </p>
          ) : (
            <p className="text-sm font-mono text-black/40 italic">
              {hasData ? 'Run GPT analysis for deep report' : 'Add signals from the tabs above'}
            </p>
          )}

          {/* Domain breakdown mini-pills */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {gitScore > 0 && (
              <div className="px-2 py-1 text-[9px] font-mono" style={{ border: BLK, background: '#fffdf5' }}>
                Git <strong style={{ color: riskLabel(gitScore).color }}>{gitScore}</strong>
              </div>
            )}
            {typingScore > 0 && (
              <div className="px-2 py-1 text-[9px] font-mono" style={{ border: BLK, background: '#fffdf5' }}>
                Typing <strong style={{ color: riskLabel(typingScore).color }}>{typingScore}</strong>
              </div>
            )}
            {activityScore > 0 && (
              <div className="px-2 py-1 text-[9px] font-mono" style={{ border: BLK, background: '#fffdf5' }}>
                Activity <strong style={{ color: riskLabel(activityScore).color }}>{activityScore}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Generate button ── */}
      <button onClick={generateReport} disabled={loading || !hasData}
        className="w-full py-3 flex items-center justify-center gap-2 font-black text-[11px] font-mono uppercase tracking-widest transition-all"
        style={{
          border: BLK,
          background: loading ? '#f0f0f0' : hasData ? '#111' : '#e5e5e5',
          color: loading || !hasData ? '#999' : '#fff',
          boxShadow: hasData && !loading ? '3px 3px 0 #111' : 'none',
        }}>
        {loading ? (
          <><RefreshCw size={12} className="animate-spin" /> Analyzing patterns…</>
        ) : (
          <><Brain size={12} /> Generate GPT Burnout Report →</>
        )}
      </button>

      {!hasData && (
        <p className="text-[10px] font-mono text-black/40 text-center">
          Connect your GitHub repo or log some activity first
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-[11px] font-mono"
          style={{ background: '#fef2f2', border: '1px solid #dc2626', color: '#dc2626' }}>
          <AlertTriangle size={12} />
          {error.includes('GPT not configured')
            ? 'GPT not configured — set OPENAI_API_KEY in .env to enable AI analysis'
            : error}
        </div>
      )}

      {/* ── Full report ── */}
      <AnimatePresence>
        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4">

            {/* Primary signals */}
            {report.primarySignals?.length > 0 && (
              <div className="p-4" style={{ border: BLK, background: risk.bg }}>
                <p className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50 mb-2">
                  Primary Burnout Signals Detected
                </p>
                <div>
                  {report.primarySignals.map((s, i) => (
                    <SignalPill key={i} text={s}
                      variant={report.riskLevel === 'critical' || report.riskLevel === 'high' ? 'crit' : 'warn'} />
                  ))}
                </div>
                {report.warningFlags?.length > 0 && (
                  <div className="mt-2 flex items-start gap-1.5 text-[10px] font-mono text-red-700">
                    <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                    <span>{report.warningFlags.join(' · ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Narrative */}
            {report.narrative && (
              <div className="p-4" style={{ border: BLK, background: '#fff' }}>
                <p className="text-[9px] font-black font-mono uppercase tracking-widest text-black/40 mb-3">
                  Analysis
                </p>
                {report.narrative.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-[11px] leading-relaxed font-mono text-black/75 mb-2">{para}</p>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations?.length > 0 && (
              <div style={{ border: BLK }}>
                <div className="px-3 py-2" style={{ borderBottom: BLK, background: '#f8f8f8' }}>
                  <span className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50">
                    Action Plan
                  </span>
                </div>
                {report.recommendations.map((r, i) => (
                  <div key={i} className="px-3 py-3 flex items-start gap-3"
                    style={{ borderBottom: i < report.recommendations.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                    <PriorityBadge priority={r.priority} />
                    <div className="flex-1">
                      <p className="text-[11px] font-black font-mono text-black mb-0.5">{r.action}</p>
                      <p className="text-[9px] font-mono text-black/50">{r.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Positives */}
            {report.positives?.length > 0 && (
              <div className="p-4" style={{ border: BLK, background: '#f0fdf4' }}>
                <p className="text-[9px] font-black font-mono uppercase tracking-widest text-black/50 mb-2">
                  <CheckCircle size={9} className="inline mr-1" />What You're Still Doing Right
                </p>
                {report.positives.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <ArrowRight size={9} className="text-green-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] font-mono text-green-800">{p}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Check-in prompt */}
            {report.checkInPrompt && (
              <div className="p-4 text-center" style={{ border: BLK, background: '#ede9fe' }}>
                <p className="text-[9px] font-black font-mono uppercase tracking-widest text-purple-500 mb-2">
                  Reflect On This
                </p>
                <p className="text-sm font-black text-purple-900" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  "{report.checkInPrompt}"
                </p>
              </div>
            )}

            {/* Crisis resources (shown if critical) */}
            {(report.riskLevel === 'critical' || report.burnoutScore >= 75) && (
              <div className="p-4" style={{ border: '2px solid #dc2626', background: '#fef2f2' }}>
                <p className="text-[10px] font-black font-mono uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1.5">
                  <Heart size={11} /> Crisis & Support Resources
                </p>
                <div className="text-[10px] font-mono text-red-800 space-y-1">
                  <p>🌐 <strong>Open Sourcing Mental Illness</strong> — osmihelp.org</p>
                  <p>📞 <strong>988 Suicide & Crisis Lifeline</strong> — call or text 988 (US)</p>
                  <p>💬 <strong>Crisis Text Line</strong> — text HOME to 741741</p>
                  <p>🧘 <a href="https://www.headspace.com" target="_blank" rel="noreferrer" className="underline">Headspace for Work</a> · <a href="https://www.calm.com" target="_blank" rel="noreferrer" className="underline">Calm</a></p>
                  <p className="mt-2 pt-2 text-[9px] border-t border-red-200">
                    This tool is not a medical device. If you are in distress, please speak to a mental health professional.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
