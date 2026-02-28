import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, ShieldCheck, Loader2, Phone, RefreshCw } from 'lucide-react';
import { CATEGORY_META } from '../data/posts';

const MAX = 1000;

export default function VentSpace() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('form'); // form | response | crisis
  const [compassion, setCompassion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVent() {
    if (!content.trim() || content.length < 20) {
      setError('Please write at least 20 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/community/submit', { content, category, isVent: true });
      if (data.isCrisis) {
        setState('crisis');
      } else {
        setCompassion(data.compassion || 'Thank you for trusting this space with what you carried today. You are heard.');
        setState('response');
      }
    } catch {
      setCompassion('Thank you for trusting this space with what you carried today. You are heard.');
      setState('response');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setContent('');
    setCategory('');
    setState('form');
    setCompassion('');
    setError('');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Wind size={22} className="text-blue-500" />
        <h2 className="text-2xl font-bold text-stone-800">Vent Space</h2>
      </div>
      <p className="text-stone-500 text-sm mb-7">
        Say what you need to say. No advice, no judgment — just a space to let it out. Everything posted here is anonymous and private to you.
      </p>

      <AnimatePresence mode="wait">
        {state === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-6">
              <div className="flex items-center gap-1.5 mb-4 text-xs text-teal-600">
                <ShieldCheck size={13} />
                Always anonymous — never stored publicly
              </div>

              {error && (
                <div className="mb-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <textarea
                className="w-full min-h-[160px] bg-white/70 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none mb-1"
                placeholder="Start typing... this space is just for you."
                value={content}
                maxLength={MAX}
                onChange={e => setContent(e.target.value)}
              />
              <div className="text-right text-xs text-stone-400 mb-4">{content.length}/{MAX}</div>

              <div className="mb-5">
                <div className="text-xs font-medium text-stone-500 mb-2">Tag it (optional)</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(k => k === key ? '' : key)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                        category === key
                          ? `${meta.bg} ${meta.text} border-transparent`
                          : 'bg-white/60 text-stone-500 border-stone-200 hover:border-blue-300'
                      }`}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleVent}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-400 text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Listening...</>
                  : 'Let it out'}
              </button>
            </div>
          </motion.div>
        )}

        {state === 'response' && (
          <motion.div key="response" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-6">
              <div className="text-xs font-semibold text-amber-700 mb-2">Community holds space for you</div>
              <p className="text-stone-700 text-sm leading-relaxed italic mb-6">"{compassion}"</p>
              <button
                onClick={reset}
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-amber-700 transition-colors"
              >
                <RefreshCw size={14} />
                Vent again
              </button>
            </div>
          </motion.div>
        )}

        {state === 'crisis' && (
          <motion.div key="crisis" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-6 border border-rose-200">
              <h3 className="font-bold text-rose-700 mb-2">You matter. Help is here.</h3>
              <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                What you shared matters. Please reach out to someone who can truly be there for you right now.
              </p>
              <div className="space-y-2 mb-5">
                {[
                  { label: 'Suicide & Crisis Lifeline', detail: 'Call or text 988 (US)' },
                  { label: 'Crisis Text Line', detail: 'Text HOME to 741741' },
                  { label: 'Samaritans', detail: '116 123 — UK & Ireland' },
                  { label: 'Beyond Blue', detail: '1300 22 4636 — Australia' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-3 border border-rose-200 bg-rose-50 rounded-xl px-4 py-3">
                    <Phone size={14} className="text-rose-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-rose-700">{l.label}</div>
                      <div className="text-xs text-stone-500">{l.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={reset} className="text-sm text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1.5">
                <RefreshCw size={13} /> Return
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
