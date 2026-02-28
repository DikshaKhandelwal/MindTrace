import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Loader2, Phone } from 'lucide-react';
import { CATEGORY_META, ANON_NAMES, ANON_COLORS } from '../data/posts';

function randomName() { return ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)]; }
function randomColor() { return ANON_COLORS[Math.floor(Math.random() * ANON_COLORS.length)]; }

const MAX = 600;

export default function PostComposer({ onClose, onPublish }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!content.trim() || content.length < 20) {
      setError('Please write at least 20 characters.');
      return;
    }
    if (!category) {
      setError('Choose a category to help others find your post.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/community/submit', { content, category });
      if (data.isCrisis) {
        setCrisis(true);
      } else {
        onPublish({
          id: `u-${Date.now()}`,
          anonymousName: randomName(),
          avatarColor: randomColor(),
          timeAgo: 'just now',
          category,
          content: content.trim(),
          reactions: { heart: 0, hug: 0, relate: 0 },
          replyCount: 0,
          compassion: data.compassion || null,
        });
        onClose();
      }
    } catch {
      // Publish locally even if API fails
      onPublish({
        id: `u-${Date.now()}`,
        anonymousName: randomName(),
        avatarColor: randomColor(),
        timeAgo: 'just now',
        category,
        content: content.trim(),
        reactions: { heart: 0, hug: 0, relate: 0 },
        replyCount: 0,
        compassion: null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="glass-card-strong w-full max-w-lg"
      >
        <AnimatePresence mode="wait">
          {crisis ? (
            <motion.div key="crisis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-rose-700">You matter. Help is here.</h2>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
              </div>
              <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                It sounds like you may be going through something really difficult. Please reach out to someone who can help right now.
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Suicide & Crisis Lifeline', detail: 'Call or text 988 (US)', color: 'border-rose-200 bg-rose-50' },
                  { label: 'Crisis Text Line', detail: 'Text HOME to 741741', color: 'border-rose-200 bg-rose-50' },
                  { label: 'Samaritans', detail: '116 123 (UK & Ireland)', color: 'border-rose-200 bg-rose-50' },
                ].map(l => (
                  <div key={l.label} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${l.color}`}>
                    <Phone size={14} className="text-rose-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-rose-700">{l.label}</div>
                      <div className="text-xs text-stone-500">{l.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                className="mt-5 w-full py-2 rounded-xl bg-stone-100 text-stone-600 text-sm hover:bg-stone-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-stone-800 text-lg">Share Your Story</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ShieldCheck size={13} className="text-teal-500" />
                    <span className="text-xs text-teal-600">Always anonymous</span>
                  </div>
                </div>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
              </div>

              {error && (
                <div className="mb-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <textarea
                className="w-full min-h-[130px] bg-white/70 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none mb-1"
                placeholder="What's on your mind? This space is just for you..."
                value={content}
                maxLength={MAX}
                onChange={e => setContent(e.target.value)}
              />
              <div className="text-right text-xs text-stone-400 mb-4">{content.length}/{MAX}</div>

              <div className="mb-5">
                <div className="text-xs font-medium text-stone-500 mb-2">Choose a category</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                        category === key
                          ? `${meta.bg} ${meta.text} border-transparent`
                          : 'bg-white/60 text-stone-500 border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sharing...</> : 'Share Anonymously'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
