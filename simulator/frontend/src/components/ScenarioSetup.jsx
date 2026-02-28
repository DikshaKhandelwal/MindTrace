import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, MessageCircle, Zap } from 'lucide-react';
import axios from 'axios';

const prompts = [
  'I need to tell my friend they\'ve been distant and it\'s hurting me',
  'I want to ask my manager for a raise without seeming demanding',
  'I need to set boundaries with my parents about visiting',
  'I have to confront my roommate about their mess',
  'I want to end a relationship kindly but firmly',
  'I need to apologize to someone I hurt',
];

export default function ScenarioSetup({ onBack, onScenarioReady }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = input.trim().length >= 10 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/simulator/setup', { userInput: input.trim() });
      onScenarioReady(res.data);
    } catch (err) {
      setError('Could not create your scenario. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-sage-300/15 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-mint-300/15 blur-3xl" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Back */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-sage-600 text-sm mb-8 transition-colors group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle size={38} className="text-sage-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-sage-500 uppercase tracking-widest">Reality Simulator</p>
              <h2 className="text-3xl font-bold text-gray-800">What do you want to practice?</h2>
            </div>
          </div>
          <p className="text-gray-500 ml-[52px]">
            Describe the situation in your own words. The more real, the more useful.
          </p>
        </motion.div>

        {/* Input card */}
        <motion.div
          className="glass-card-strong p-1 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. I want to confront my best friend about how they always cancel plans last minute, but I'm scared of their reaction..."
            className="w-full bg-transparent resize-none outline-none text-gray-700 placeholder-gray-400 text-base leading-relaxed p-5 min-h-[140px]"
            maxLength={500}
            disabled={loading}
          />
          <div className="flex items-center justify-between px-5 pb-4">
            <span className="text-xs text-gray-400">{input.length}/500</span>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm
                bg-gradient-to-r from-sage-500 to-forest-500
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:shadow-soft-lg hover:scale-105 active:scale-100 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating scenario…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Build My Scenario
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="glass-card p-6 mb-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-center gap-3 mb-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-sage-400"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.18, repeat: Infinity }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium">Designing your scenario and building the character…</p>
              <p className="text-xs text-gray-400 mt-1">This takes just a few seconds</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm mb-6"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example prompts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Or try one of these
          </p>
          <div className="flex flex-col gap-2">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => setInput(p)}
                disabled={loading}
                className="text-left px-4 py-3 glass-card text-sm text-gray-600 hover:text-sage-700 hover:shadow-soft transition-all duration-200 disabled:opacity-50"
              >
                <span className="mr-2 text-sage-400">&#8594;</span>
                {p}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
