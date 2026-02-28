import { motion } from 'framer-motion';
import { ArrowRight, Brain, Shield, Zap, Users, Activity, BarChart2, RotateCcw } from 'lucide-react';

const features = [
  {
    Icon: Users,
    label: 'Realistic Roleplay',
    desc: 'AI personas that react authentically to your tone and words',
    color: 'bg-sage-100 text-sage-700',
  },
  {
    Icon: Activity,
    label: 'Emotion-Aware AI',
    desc: "Watch the persona's emotional state shift in real time",
    color: 'bg-mint-100 text-mint-700',
  },
  {
    Icon: BarChart2,
    label: 'Coach Feedback',
    desc: 'Assertiveness, empathy & clarity scores after every session',
    color: 'bg-sage-100 text-forest-600',
  },
  {
    Icon: RotateCcw,
    label: 'Replay & Improve',
    desc: 'See better response options and practice again',
    color: 'bg-mint-50 text-sage-600',
  },
];

const scenarios = [
  'Confronting a friend who borrowed money',
  'Asking your boss for a raise',
  'Setting limits with a family member',
  "Addressing a partner's hurtful behaviour",
  'Resolving conflict with a coworker',
];

export default function LandingPage({ onStart, onBackToHub }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-12 overflow-hidden">
      {onBackToHub && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-sage-700 bg-white/60 backdrop-blur-sm border border-white/60 px-3 py-1.5 rounded-full transition-colors shadow-sm"
          >
            ← MindTrace Hub
          </button>
        </div>
      )}

      {/* Header */}
      <motion.div
        className="text-center mb-12 relative z-10 w-full max-w-5xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sage-100/80 backdrop-blur-sm rounded-full text-sage-700 text-sm font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
          MindTrace · Module 1
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 via-forest-500 to-mint-500">
            Reality Simulator
          </span>
        </h1>

        <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
          Practice emotionally difficult conversations in a safe, judgment-free space.
          <br />
          <span className="text-gray-800 font-medium">Train for real life.</span>
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-14 relative z-10"
      >
        <button
          onClick={onStart}
          className="group flex items-center gap-3 px-9 py-4 rounded-2xl font-semibold text-white text-lg
            bg-gradient-to-r from-sage-500 to-forest-600 shadow-glow
            hover:shadow-[0_0_40px_rgba(61,138,99,0.4)] hover:scale-105
            active:scale-100 transition-all duration-300"
        >
          Begin a Session
          <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200" size={20} />
        </button>
        <p className="text-center text-xs text-gray-500 mt-3">Free · Private · No judgment</p>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-5xl w-full mb-14 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            className="glass-card p-6 text-center hover:shadow-soft-lg transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 ${f.color}`}>
              <f.Icon size={22} />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">{f.label}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Example scenarios */}
      <motion.div
        className="w-full max-w-4xl relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          What people practice
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {scenarios.map((s) => (
            <span
              key={s}
              className="inline-flex items-center px-4 py-2 glass-card text-sm text-gray-600 hover:shadow-soft transition-shadow cursor-default"
            >
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Trust bar */}
      <motion.div
        className="flex items-center gap-6 mt-12 text-xs text-gray-500 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <span className="flex items-center gap-1.5"><Shield size={12} /> No data stored</span>
        <span className="w-px h-4 bg-gray-300" />
        <span className="flex items-center gap-1.5"><Brain size={12} /> GPT-4o powered</span>
        <span className="w-px h-4 bg-gray-300" />
        <span className="flex items-center gap-1.5"><Zap size={12} /> Real-time analysis</span>
      </motion.div>
    </div>
  );
}
