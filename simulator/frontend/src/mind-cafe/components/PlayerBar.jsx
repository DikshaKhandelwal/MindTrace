import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';

export default function PlayerBar({ hearts, max, served, isNight }) {
  const pct = (hearts / max) * 100;
  const lowEnergy = hearts <= 2;

  return (
    <motion.div
      className="flex items-center justify-between px-5 py-2.5 shrink-0"
      style={{
        background: 'rgba(0,0,0,0.25)',
        borderBottom: '1px solid rgba(180,100,30,0.15)',
      }}
      animate={lowEnergy ? { boxShadow: ['0 0 0 rgba(239,68,68,0)', '0 0 12px rgba(239,68,68,0.15)', '0 0 0 rgba(239,68,68,0)'] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Hearts */}
      <div className="flex items-center gap-1.5">
        {[...Array(max)].map((_, i) => (
          <motion.div
            key={i}
            animate={i < hearts ? {} : { scale: [1, 0.85, 1] }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <span style={{ fontSize: 14, opacity: i < hearts ? 1 : 0.18 }}>
              {i < hearts ? '❤️' : '🖤'}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Barista energy bar */}
      <div className="flex items-center gap-2">
        <Coffee size={10} style={{ color: 'rgba(253,186,116,0.4)' }} />
        <div className="w-24 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
            style={{
              background: lowEnergy
                ? 'linear-gradient(to right, #ef4444, #f87171)'
                : 'linear-gradient(to right, #d97706, #fbbf24)',
            }}
          />
        </div>
        {lowEnergy && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-mono text-[10px]"
            style={{ color: '#ef4444' }}
          >
            You need a break
          </motion.span>
        )}
      </div>

      {/* Served count */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'rgba(253,186,116,0.3)' }}>
          Served
        </span>
        <span className="font-mono text-xs font-bold" style={{ color: '#fbbf24' }}>{served}</span>
      </div>
    </motion.div>
  );
}
