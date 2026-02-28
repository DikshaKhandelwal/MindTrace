import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { POSTS } from '../data/posts';
import PostCard from './PostCard';

export default function CircleRoom({ circle, go }) {
  if (!circle) {
    go('circles');
    return null;
  }

  const Icon = circle.icon;
  const filtered = POSTS.filter(p => p.category === circle.category);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => go('circles')}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-amber-700 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        All Circles
      </button>

      {/* Circle header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 mb-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${circle.accentBg}`}>
            <Icon size={24} className={circle.color} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800">{circle.name}</h2>
            <p className="text-xs text-stone-500">{circle.members.toLocaleString()} members · {circle.activeToday} active today</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed mb-3">{circle.description}</p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
          <div className="text-xs font-semibold text-amber-700 mb-1">This week's prompt</div>
          <div className="text-sm text-stone-700 italic">"{circle.weeklyPrompt}"</div>
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-stone-400"
            >
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No posts in this circle yet.</p>
              <p className="text-xs mt-1">Start the conversation.</p>
            </motion.div>
          ) : (
            filtered.map(post => <PostCard key={post.id} post={post} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
