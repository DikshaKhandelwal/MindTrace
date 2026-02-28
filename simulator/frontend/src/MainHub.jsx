import { motion } from 'framer-motion';
import { Brain, Users, Heart, Zap, ActivitySquare, ArrowRight, Sparkles, Shield, Activity, Moon } from 'lucide-react';

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
  {
    id: 'mind-check',
    badge: 'Module 05',
    title: 'Mind Check',
    subtitle: 'A signal — not a diagnosis',
    description:
      'Ten real-life scenarios. Your honest reactions. In 5 minutes, find out whether what you\'re carrying is normal weight or a signal worth taking seriously — and what kind of support might actually help.',
    Icon: ActivitySquare,
    gradient: 'from-stone-400 to-stone-600',
    glow: 'rgba(168,162,158,0.30)',
    features: ['10 scenarios', 'No right answers', 'Signal not score', 'Professional guidance'],
    bg: 'from-stone-800/40 to-stone-900/30',
    border: 'border-stone-400/25',
    dotColor: 'bg-stone-400',
    cta: 'Check Your Signal',
  },
  
  {
    id: 'sleep-guardian',
    badge: 'Module 06',
    title: 'Sleep Guardian',
    subtitle: 'Luna watches over your nights',
    description:
      'Track caffeine timing, bedtime habits, and screen-off patterns. Luna — your sleepy ghost companion — reacts to your sleep health and earns Moon Cookies for good nights.',
    Icon: Moon,
    gradient: 'from-indigo-500 to-violet-700',
    glow: 'rgba(99,79,220,0.35)',
    features: ['Ghost mood tracker', 'Caffeine half-life', 'Moon Cookies', 'Streak rewards'],
    bg: 'from-indigo-900/50 to-violet-900/30',
    border: 'border-indigo-400/30',
    dotColor: 'bg-indigo-400',
    cta: 'Ask Luna',
  },
  {
    id: 'clarity-engine',
    badge: 'Module 04',
    title: 'Clarity Engine',
    subtitle: 'Cognitive Debugger — map, challenge, and rewire your thinking',
    description:
      'A system that visualizes your thinking as a live graph, detects fear loops and cognitive biases, simulates future paths, and guides you from overthinking to clear, confident decisions.',
    Icon: Zap,
    gradient: 'from-pink-500 to-purple-500',
    glow: 'rgba(236,72,153,0.30)',
    features: ['Thought graph', 'Loop detector', 'Bias scanner', 'Regret simulation'],
    bg: 'from-pink-900/40 to-purple-900/20',
    border: 'border-pink-400/30',
    dotColor: 'bg-pink-400',
    cta: 'Debug My Thinking',
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
        className="font-serif font-black text-center mb-4 leading-none"
        style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', letterSpacing: '-0.02em' }}
      >
        <span className="text-white">Your mind,</span>{' '}
        <span className="bg-gradient-to-r from-sage-400 via-teal-300 to-amber-300 bg-clip-text text-transparent italic">
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

              <h2 className="font-serif font-black text-2xl text-white mb-1">{title}</h2>
              <p className="font-mono text-xs font-medium text-white/45 mb-3">{subtitle}</p>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 flex flex-col items-center gap-4"
      >
        <p className="text-stone-600 text-xs text-center">
          All conversations and community posts are private. Nothing is identified.
        </p>

        {/* Joy page shortcut */}
        <motion.button
          onClick={() => onEnter('joy')}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-mono transition-all"
          style={{
            borderColor: 'rgba(240,100,150,0.25)',
            background:  'rgba(240,100,150,0.07)',
            color:       'rgba(240,150,180,0.75)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,100,150,0.15)'; e.currentTarget.style.borderColor = 'rgba(240,100,150,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,100,150,0.07)'; e.currentTarget.style.borderColor = 'rgba(240,100,150,0.25)'; }}
        >
          <span style={{ fontSize: '0.9rem' }}>💗</span>
          need a moment?
        </motion.button>
      </motion.div>
    </div>
  );
}
