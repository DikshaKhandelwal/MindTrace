import { motion } from 'framer-motion';
import {
  MessageCircle, Users, Wind, HeartPulse, BookOpen,
  Heart, Shield, Clock, UserCheck,
} from 'lucide-react';

const STATS = [
  { label: 'Community Members', value: '12,400+', Icon: Users, color: 'text-amber-600' },
  { label: 'Check-ins Today',   value: '3,241',   Icon: HeartPulse, color: 'text-teal-600' },
  { label: 'Always Anonymous',  value: '100%',    Icon: Shield,   color: 'text-rose-500' },
  { label: 'Always Available',  value: '24/7',    Icon: Clock,    color: 'text-indigo-500' },
];

const CARDS = [
  {
    key: 'feed',
    title: 'Community Feed',
    desc: 'Read stories and share your own anonymously',
    Icon: MessageCircle,
    gradient: 'from-amber-400 to-orange-400',
  },
  {
    key: 'circles',
    title: 'Support Circles',
    desc: 'Find your people in topic-focused safe spaces',
    Icon: Users,
    gradient: 'from-teal-400 to-cyan-400',
  },
  {
    key: 'vent',
    title: 'Vent Anonymously',
    desc: 'Say what you need to say — no judgment, ever',
    Icon: Wind,
    gradient: 'from-blue-400 to-indigo-400',
  },
  {
    key: 'checkin',
    title: 'Daily Check-In',
    desc: 'Track your mood alongside the community',
    Icon: HeartPulse,
    gradient: 'from-rose-400 to-pink-400',
  },
  {
    key: 'resources',
    title: 'Resource Hub',
    desc: 'Crisis lines, breathing tools, and reading',
    Icon: BookOpen,
    gradient: 'from-violet-400 to-purple-400',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ModuleHome({ go }) {
  return (
    <div className="min-h-screen px-4 pt-10 pb-16 flex flex-col items-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        MindTrace · Module 2 — Social Connect
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-5xl font-extrabold text-center mb-4 leading-tight"
      >
        You are{' '}
        <span className="bg-gradient-to-r from-amber-500 via-rose-400 to-teal-500 bg-clip-text text-transparent">
          not alone.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-stone-600 text-center max-w-xl mb-10 text-base leading-relaxed"
      >
        A safe, anonymous community where real people share what they're carrying. No advice needed. Just presence.
      </motion.p>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-10"
      >
        {STATS.map(({ label, value, Icon, color }) => (
          <motion.div key={label} variants={item} className="glass-card p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-1.5`} />
            <div className="text-xl font-bold text-stone-800">{value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl mb-10"
      >
        {CARDS.map(({ key, title, desc, Icon, gradient }) => (
          <motion.button
            key={key}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => go(key)}
            className="glass-card p-5 text-left group cursor-pointer hover:shadow-warm transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="font-semibold text-stone-800 mb-1 group-hover:text-amber-700 transition-colors">
              {title}
            </div>
            <div className="text-xs text-stone-500 leading-relaxed">{desc}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-2 text-stone-400 text-xs"
      >
        <Heart size={13} className="text-rose-300" />
        Everything here is anonymous. You control what you share.
        <UserCheck size={13} className="text-teal-400 ml-1" />
      </motion.div>
    </div>
  );
}
