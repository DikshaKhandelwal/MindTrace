import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { MOOD_META, SHARED_INSIGHTS } from '../data/circle';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function Insights({ members, go }) {
  const [tab, setTab] = useState('circle'); // circle | growth | contagion

  return (
    <div className="min-h-screen px-4 pt-20 pb-12 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs font-bold tracking-widest text-violet-400/60 uppercase mb-2">Insights</div>
        <h2 className="text-4xl font-extrabold text-white/90 mb-6">What patterns show up?</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'circle',    label: 'Your Circle',    Icon: Users },
            { key: 'growth',    label: 'Growth',         Icon: TrendingUp },
            { key: 'contagion', label: 'Ripple Effect',  Icon: Activity },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                tab === key
                  ? 'bg-violet-600/25 border-violet-500/40 text-violet-200'
                  : 'bg-white/4 border-white/8 text-white/40 hover:text-white/60'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Circle insights */}
        {tab === 'circle' && (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {members.length === 0 ? (
              <div className="inner-card p-8 text-center">
                <div className="text-white/25 text-base mb-1">No one in your circle yet.</div>
                <div className="text-white/18 text-sm">Add people to start seeing insights about your connections.</div>
              </div>
            ) : members.map(m => {
              const mm = MOOD_META[m.currentMood];
              return (
                <motion.div key={m.id} variants={item} className="inner-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: `hsl(${m.avatarHue},45%,25%)` }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-white/80">{m.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mm.color }} />
                        <span className={`text-xs ${mm.text}`}>{mm.label}</span>
                        {m.streakDays > 1 && (
                          <span className="text-white/25 text-xs">for {m.streakDays} days</span>
                        )}
                      </div>
                    </div>
                    <div className={`ml-auto text-xs px-2 py-0.5 rounded-full risk-${m.riskLevel}`}>
                      {m.riskLevel} risk
                    </div>
                  </div>
                  {m.insights?.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-white/5">
                      {m.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-1 h-1 rounded-full bg-violet-400/50 mt-2 flex-shrink-0" />
                          <p className="text-white/45 text-sm leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => go('compose', { composeFor: m.id })}
                    className="mt-3 text-xs text-violet-300/60 hover:text-violet-200 transition-colors"
                  >
                    Reach out to {m.name}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        {tab === 'growth' && (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <p className="text-white/35 text-sm mb-4">Anonymous patterns from people in similar situations.</p>
            {SHARED_INSIGHTS.map((insight, i) => (
              <motion.div
                key={i}
                variants={item}
                className="inner-card p-5 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp size={12} className="text-violet-300/70" />
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Emotional contagion */}
        {tab === 'contagion' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-white/35 text-sm mb-4">
              How moods in your circle influence each other — emotional contagion is real and subtle.
            </p>

            {members.length < 2 ? (
              <div className="inner-card p-8 text-center">
                <div className="text-white/25 text-base mb-1">Patterns will appear here.</div>
                <div className="text-white/18 text-sm mt-1">
                  Once you have people in your circle and start sharing moods, you'll see ripple effects over time.
                </div>
              </div>
            ) : (
              <>
                <div className="inner-card p-5">
                  <div className="text-xs text-white/30 mb-2">How you respond pattern</div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    When someone in your circle has been feeling low for multiple days, observe whether your check-in
                    frequency changes. Most people check in less when it feels heavy — but that's exactly when it matters most.
                  </p>
                  <div className="flex gap-2 items-center text-xs text-white/25">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span>Low × multiple days → track your engagement pattern</span>
                  </div>
                </div>

                <div className="inner-card p-5">
                  <div className="text-xs text-white/30 mb-2">Ripple awareness</div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    Your emotional state radiates outward. When you share a "great" mood and reach out,
                    research shows it positively influences the people who receive that energy.
                    Your wellbeing is not separate from theirs.
                  </p>
                  <div className="flex gap-2 items-center text-xs text-white/25">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Your state → circle wellbeing correlation</span>
                  </div>
                </div>

                {members.filter(m => m.currentMood === 'low' || m.currentMood === 'overwhelmed').map(m => (
                  <div key={m.id} className="inner-card p-5"
                    style={{ borderLeft: '2px solid rgba(251,146,60,0.35)' }}
                  >
                    <div className="text-xs text-white/30 mb-2">Awareness prompt</div>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {m.name} has been feeling {m.currentMood} for {m.streakDays} day{m.streakDays > 1 ? 's' : ''}.
                      {m.supportStyle === 'check-ins'
                        ? ' They appreciate being checked on — a short message now could mean a lot.'
                        : m.supportStyle === 'just-listen'
                        ? ' They need to be heard, not advised. Just being present is enough.'
                        : ' Reaching out in a way that matches their style will be most effective.'}
                    </p>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
