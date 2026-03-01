import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Loader2, Pencil } from 'lucide-react';
import axios from 'axios';
import PostCard from './PostCard';
import PostComposer from './PostComposer';

export default function CircleRoom({ circle, go }) {
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    if (!circle) return;
    setLoading(true);
    axios
      .get(`/api/community/posts?category=${circle.category}`)
      .then(r => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [circle]);

  if (!circle) { go('circles'); return null; }

  const Icon = circle.icon;

  function handleNewPost(post) {
    if (post) setPosts(prev => [post, ...prev]);
  }

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
            <p className="text-xs text-stone-500">
              {circle.members.toLocaleString()} members
              {circle.liveToday != null
                ? ` · ${circle.liveToday} active today`
                : circle.activeToday
                  ? ` · ${circle.activeToday} active today`
                  : ''}
              {posts.length > 0 && ` · ${posts.length} posts`}
            </p>
          </div>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed mb-3">{circle.description}</p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
          <div className="text-xs font-semibold text-amber-700 mb-1">This week's prompt</div>
          <div className="text-sm text-stone-700 italic">"{circle.weeklyPrompt}"</div>
        </div>
      </motion.div>

      {/* Add post button */}
      <button
        onClick={() => setComposerOpen(true)}
        className="w-full mb-5 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-amber-300 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors"
      >
        <Pencil size={14} /> Share in this circle
      </button>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-amber-400" />
          </div>
        ) : (
          <AnimatePresence>
            {posts.length === 0 ? (
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
              posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Composer modal */}
      <AnimatePresence>
        {composerOpen && (
          <PostComposer
            defaultCategory={circle.category}
            onClose={() => setComposerOpen(false)}
            onPublish={handleNewPost}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
