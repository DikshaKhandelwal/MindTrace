import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { POSTS, CATEGORY_META } from '../data/posts';
import PostCard from './PostCard';
import PostComposer from './PostComposer';

const FILTERS = ['all', ...Object.keys(CATEGORY_META)];

export default function CommunityFeed({ initialFilter = 'all' }) {
  const [posts, setPosts] = useState(POSTS);
  const [filter, setFilter] = useState(initialFilter);
  const [composerOpen, setComposerOpen] = useState(false);

  const visible = filter === 'all' ? posts : posts.filter(p => p.category === filter);

  function handleNewPost(post) {
    setPosts(prev => [post, ...prev]);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-1">Community Feed</h2>
      <p className="text-stone-500 text-sm mb-5">Anonymous stories from real people.</p>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => {
          const meta = CATEGORY_META[f];
          const isAll = f === 'all';
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                isActive
                  ? isAll
                    ? 'bg-amber-500 text-white border-transparent'
                    : `${meta.bg} ${meta.text} border-transparent`
                  : 'bg-white/60 text-stone-500 border-stone-200 hover:border-amber-300'
              }`}
            >
              {isAll ? 'All' : meta.label}
            </button>
          );
        })}
      </div>

      {/* Post list */}
      <div className="space-y-4">
        <AnimatePresence>
          {visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-stone-400 text-sm"
            >
              No posts in this category yet. Be the first to share.
            </motion.div>
          ) : (
            visible.map(post => <PostCard key={post.id} post={post} />)
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setComposerOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold text-sm rounded-full shadow-warm hover:opacity-90 transition-opacity z-40"
      >
        <Pencil size={16} />
        Share Your Story
      </motion.button>

      {/* Composer modal */}
      <AnimatePresence>
        {composerOpen && (
          <PostComposer
            onClose={() => setComposerOpen(false)}
            onPublish={handleNewPost}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
