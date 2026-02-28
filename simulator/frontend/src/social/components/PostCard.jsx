import { useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wind, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { CATEGORY_META } from '../data/posts';

export default function PostCard({ post }) {
  const [reactions, setReactions] = useState({
    heart: post.reactions.heart,
    hug:   post.reactions.hug,
    relate: post.reactions.relate,
  });
  const [toggled, setToggled] = useState({ heart: false, hug: false, relate: false });
  const [showCompassion, setShowCompassion] = useState(false);

  const meta = CATEGORY_META[post.category] ?? { label: post.category, bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' };

  const toggle = useCallback((key) => {
    const willBeOn = !toggled[key];
    const delta    = willBeOn ? 1 : -1;
    // Optimistic update
    setToggled(prev => ({ ...prev, [key]: willBeOn }));
    setReactions(prev => ({ ...prev, [key]: prev[key] + delta }));
    // Persist to backend (fire & forget — revert on fail)
    axios.post(`/api/community/react/${post.id}`, { type: key, delta }).catch(() => {
      setToggled(prev => ({ ...prev, [key]: !willBeOn }));
      setReactions(prev => ({ ...prev, [key]: prev[key] - delta }));
    });
  }, [toggled, post.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-card p-5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ backgroundColor: post.avatarColor }}
          >
            {post.anonymousName[0]}
          </div>
          <div>
            <div className="font-semibold text-stone-700 text-sm">{post.anonymousName}</div>
            <div className="text-xs text-stone-400">{post.timeAgo}</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${meta.bg} ${meta.text} flex-shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      {/* Content */}
      <p className="text-stone-700 text-sm leading-relaxed mb-4">{post.content}</p>

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => toggle('heart')}
          className={`reaction-btn ${toggled.heart ? 'bg-rose-100 text-rose-600 border-rose-300' : ''}`}
        >
          <Heart size={14} className={toggled.heart ? 'fill-rose-500 text-rose-500' : ''} />
          <span>{reactions.heart}</span>
        </button>

        <button
          onClick={() => toggle('hug')}
          className={`reaction-btn ${toggled.hug ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}`}
        >
          <Wind size={14} className={toggled.hug ? 'text-amber-600' : ''} />
          <span className="text-xs">Sending warmth · {reactions.hug}</span>
        </button>

        <button
          onClick={() => toggle('relate')}
          className={`reaction-btn ${toggled.relate ? 'bg-teal-100 text-teal-700 border-teal-300' : ''}`}
        >
          <MessageSquare size={14} className={toggled.relate ? 'text-teal-600' : ''} />
          <span className="text-xs">I feel this · {reactions.relate}</span>
        </button>

        {post.compassion && (
          <button
            onClick={() => setShowCompassion(v => !v)}
            className="ml-auto text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors"
          >
            Community response
            {showCompassion ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Compassion block */}
      <AnimatePresence>
        {showCompassion && post.compassion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-stone-600 italic leading-relaxed">
              {post.compassion}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
