import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Heart } from 'lucide-react';
import { GLOBAL_HISTORY } from '../data/circle';
import { MOOD_META } from '../data/circle';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.3 } } };

export default function CheckHistory({ members, go }) {
  const given    = GLOBAL_HISTORY.filter(h => h.type === 'sent');
  const received = GLOBAL_HISTORY.filter(h => h.type === 'received');

  return (
    <div className="min-h-screen px-4 pt-20 pb-12 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs font-bold tracking-widest text-violet-400/60 uppercase mb-2">History</div>
        <h2 className="text-4xl font-extrabold text-white/90 mb-2">Check-in Timeline</h2>
        <p className="text-white/35 text-base mb-8">A record of care, given and received.</p>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="inner-card p-5 text-center">
            <div className="text-3xl font-bold text-violet-300 mb-1">{given.length}</div>
            <div className="text-white/35 text-sm">Support given</div>
          </div>
          <div className="inner-card p-5 text-center">
            <div className="text-3xl font-bold text-emerald-300 mb-1">{received.length}</div>
            <div className="text-white/35 text-sm">Support received</div>
          </div>
        </div>

        {/* Full timeline */}
        <div className="inner-card p-5">
          <div className="text-xs text-white/30 mb-4">Full timeline</div>
          {GLOBAL_HISTORY.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-white/20 text-base">No check-ins recorded yet.</div>
              <div className="text-white/15 text-sm mt-1">Start reaching out to people in your circle.</div>
            </div>
          ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-0">
            {GLOBAL_HISTORY.map((entry, i) => {
              const isSent = entry.type === 'sent';
              return (
                <motion.div
                  key={i}
                  variants={item}
                  className="flex gap-4 pb-5 relative"
                >
                  {/* Line */}
                  {i < GLOBAL_HISTORY.length - 1 && (
                    <div className="absolute left-[19px] top-7 bottom-0 w-px bg-white/5" />
                  )}

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSent ? 'bg-violet-500/15' : 'bg-emerald-500/12'
                  }`}>
                    {isSent
                      ? <ArrowUpRight size={15} className="text-violet-300/70" />
                      : <ArrowDownLeft size={15} className="text-emerald-300/70" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white/60 text-sm font-medium">
                        {isSent ? `You → ${entry.to}` : `${entry.from} → You`}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed">"{entry.text}"</p>
                    <div className="text-white/20 text-xs mt-1">{entry.date}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          )}
        </div>

        {/* Highlight */}
        {GLOBAL_HISTORY.length > 0 && (
        <div className="inner-card p-5 mt-4 border border-violet-500/15">
          <div className="flex items-start gap-3">
            <Heart size={16} className="text-rose-300/60 mt-0.5 flex-shrink-0" />
            <p className="text-white/45 text-sm leading-relaxed">
              Every check-in you send is a small act of care. It adds up over time.
            </p>
          </div>
        </div>
        )}
      </motion.div>
    </div>
  );
}
