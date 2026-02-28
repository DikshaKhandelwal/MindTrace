import { motion } from 'framer-motion';
import { Brain, Users, Heart, ArrowRight, Sparkles, Shield, Activity } from 'lucide-react';

const MODULES = [
  {
    id: 'simulator',
    badge: 'Module 01',
    title: 'Reality Simulator',
    subtitle: 'Practice real conversations in a safe space',
    description:
      'AI-powered social scenario training. Step into realistic situations — job interviews, conflict resolution, difficult conversations — and build confidence through practice.',
    Icon: Brain,
    gradient: 'from-sage-500 to-emerald-600',
    glow: 'rgba(61,138,99,0.35)',
    features: ['12 scenario types', '3D immersive mode', 'AI feedback reports', 'Adaptive personas'],
    bg: 'from-sage-900/40 to-sage-800/20',
    border: 'border-sage-400/30',
    dotColor: 'bg-sage-400',
    cta: 'Start Practicing',
  },
  {
    id: 'social',
    badge: 'Module 02',
    title: 'Social Connect',
    subtitle: 'Community support for mental health',
    description:
      'An anonymous, judgment-free community where real people share what they\'re carrying. Support circles, daily check-ins, a vent space, and crisis resources.',
    Icon: Users,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.3)',
    features: ['Anonymous posting', 'Support circles', 'AI compassion', 'Crisis resources'],
    bg: 'from-amber-900/40 to-orange-900/20',
    border: 'border-amber-400/30',
    dotColor: 'bg-amber-400',
    cta: 'Join Community',
  },
  {
    id: 'inner-circle',
    badge: 'Module 03',
    title: 'Inner Circle',
    subtitle: 'Private intelligent support network',
    description:
      'A curated trust network for people you actually care about. Emotional states, smart check-ins, guided support, and the patterns that make relationships stronger.',
    Icon: Heart,
    gradient: 'from-violet-500 to-indigo-600',
    glow: 'rgba(139,92,246,0.3)',
    features: ['Max 5 people', 'Mood network graph', 'Tone guard', 'Behavior insights'],
    bg: 'from-violet-900/40 to-indigo-900/20',
    border: 'border-violet-400/30',
    dotColor: 'bg-violet-400',
    cta: 'Enter Your Circle',
  },
];

const STATS = [
  { label: 'Active Users', value: '24K+', Icon: Activity },
  { label: 'Privacy First', value: '100%', Icon: Shield },
  { label: 'AI-Powered', value: 'GPT-4o', Icon: Sparkles },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MainHub({ onEnter }) {
  return (
    <div className="hub-bg min-h-screen flex flex-col items-center px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-2"
      >
        <span className="text-xs font-semibold tracking-widest text-sage-400 uppercase">MindTrace</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="text-5xl sm:text-6xl font-extrabold text-center mb-4 leading-tight"
      >
        <span className="text-white">Your mind,</span>{' '}
        <span className="bg-gradient-to-r from-sage-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
          supported.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-stone-400 text-center max-w-xl mb-3 text-base leading-relaxed"
      >
        Two tools, one platform — built to help you communicate better and feel less alone.
      </motion.p>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-6 mb-12 flex-wrap justify-center"
      >
        {STATS.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center gap-2 text-stone-400 text-sm">
            <Icon size={14} className="text-sage-400" />
            <span className="font-semibold text-white/80">{value}</span>
            <span>{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Module cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl"
      >
        {MODULES.map(({ id, badge, title, subtitle, description, Icon, gradient, glow, features, bg, border, dotColor, cta }) => (
          <motion.div
            key={id}
            variants={item}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`relative rounded-3xl border ${border} bg-gradient-to-br ${bg} backdrop-blur-xl overflow-hidden group cursor-pointer`}
            style={{ boxShadow: `0 0 0 1px ${border}` }}
            onClick={() => onEnter(id)}
          >
            {/* Glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-3xl"
              style={{ boxShadow: `0 0 60px ${glow}` }}
            />

            <div className="p-7 relative z-10">
              {/* Badge + icon */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold tracking-widest text-white/40 uppercase">{badge}</span>
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
              <p className="text-sm font-medium text-white/50 mb-3">{subtitle}</p>
              <p className="text-sm text-white/60 leading-relaxed mb-6">{description}</p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {features.map(f => (
                  <span key={f} className="flex items-center gap-1 text-xs text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <button
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity`}
              >
                {cta}
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 text-stone-600 text-xs text-center"
      >
        All conversations and community posts are private. Nothing is identified.
      </motion.p>
    </div>
  );
}
