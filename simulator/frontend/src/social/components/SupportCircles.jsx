import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CIRCLES } from '../data/circles';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function SupportCircles({ go }) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get('/api/community/circle-stats')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-1">Support Circles</h2>
      <p className="text-stone-500 text-sm mb-7">Find people who understand what you're going through.</p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {CIRCLES.map(circle => {
          const Icon = circle.icon;
          const live = stats[circle.category];
          const postCount = live?.posts ?? 0;
          const todayCount = live?.today ?? circle.activeToday;
          return (
            <motion.button
              key={circle.id}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => go('circle', { circle: { ...circle, liveToday: todayCount } })}
              className="circle-card glass-card p-5 text-left group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${circle.accentBg}`}>
                <Icon size={22} className={circle.color} />
              </div>

              <div className="font-semibold text-stone-800 text-sm group-hover:text-amber-700 transition-colors mb-1">
                {circle.name}
              </div>
              <div className="text-xs text-stone-500 leading-relaxed mb-4">{circle.tagline}</div>

              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>
                  {postCount > 0
                    ? `${postCount} post${postCount !== 1 ? 's' : ''}`
                    : `${circle.members.toLocaleString()} members`}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  {todayCount} today
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
