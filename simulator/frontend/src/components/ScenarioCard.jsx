import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Zap, Lightbulb, MessageSquare, Box, Film } from 'lucide-react';

const difficultyConfig = {
  Beginner:     { color: 'bg-mint-100 text-mint-700',   dot: 'bg-mint-400' },
  Intermediate: { color: 'bg-sage-100 text-sage-700',   dot: 'bg-sage-400' },
  Advanced:     { color: 'bg-peach-100 text-peach-700', dot: 'bg-peach-400' },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function ScenarioCard({ data, onBegin, onBack }) {
  const { scenario, persona, tips } = data;
  const diff = difficultyConfig[scenario.difficulty] || difficultyConfig.Intermediate;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-sage-300/12 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full bg-mint-300/12 blur-3xl" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Back */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-sage-600 text-sm mb-8 transition-colors group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Change scenario
        </motion.button>

        {/* Scene header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sage-100 rounded-full text-sage-700 text-sm font-medium mb-4">
            <Film size={14} className="text-sage-500" />
            Setting the Scene
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{scenario.title}</h2>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Scenario description */}
          <motion.div variants={itemVariants} className="glass-card-strong p-6">
            <p className="text-gray-700 leading-relaxed text-base">{scenario.description}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={12} className="text-lavender-400" />
                {scenario.setting}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Zap size={12} className="text-peach-400" />
                At stake: {scenario.stakes}
              </span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${diff.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                {scenario.difficulty}
              </span>
            </div>
          </motion.div>

          {/* Persona card */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              You'll be talking to
            </p>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-200 to-mint-200 flex items-center justify-center text-2xl font-bold text-sage-700 shadow-soft">
                {persona.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{persona.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {persona.relationship} · {persona.age}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{persona.backstory}</p>
                <div className="flex flex-wrap gap-1.5">
                  {persona.personality.map((trait) => (
                    <span key={trait} className="tag bg-sage-50 text-sage-700">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Opening line preview */}
            <div className="mt-5 bg-gray-50/80 rounded-2xl px-5 py-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-2">They'll start with…</p>
              <p className="text-gray-700 text-sm italic">"{data.openingMessage}"</p>
            </div>
          </motion.div>

          {/* Tips */}
          {tips && tips.length > 0 && (
            <motion.div variants={itemVariants} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={16} className="text-peach-500" />
                <p className="text-sm font-semibold text-gray-700">Coach tips for this conversation</p>
              </div>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-peach-100 text-peach-700 flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* CTA — two modes */}
          <motion.div variants={itemVariants} className="space-y-3 pt-2">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Choose your experience
            </p>
            <div className="flex gap-3">
              {/* Chat mode */}
              <button
                onClick={() => onBegin('chat')}
                className="flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl font-semibold text-sage-700
                  bg-sage-50 border-2 border-sage-200
                  hover:border-sage-400 hover:bg-sage-100 active:scale-98 transition-all duration-200"
              >
                <MessageSquare size={22} className="text-lavender-500" />
                <span className="text-sm">Chat Mode</span>
                <span className="text-xs font-normal text-sage-500 text-center leading-tight px-2">
                  Text + voice in a<br />clean chat interface
                </span>
              </button>

              {/* Immersive room mode */}
              <button
                onClick={() => onBegin('immersive')}
                className="flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl font-semibold text-white
                  bg-gradient-to-br from-sage-500 to-forest-600 shadow-glow
                  hover:shadow-[0_0_40px_rgba(61,138,99,0.4)] hover:scale-[1.02]
                  active:scale-100 transition-all duration-300"
              >
                <Box size={22} />
                <span className="text-sm">Immersive Room</span>
                <span className="text-xs font-normal text-sage-100 text-center leading-tight px-2">
                  3D environment with<br />a character & voice
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
