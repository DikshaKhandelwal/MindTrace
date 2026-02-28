import { MessageCircle, Users, Wind, HeartPulse, BookOpen, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { key: 'feed',      label: 'Community',  Icon: MessageCircle },
  { key: 'circles',   label: 'Circles',    Icon: Users },
  { key: 'vent',      label: 'Vent Space', Icon: Wind },
  { key: 'checkin',   label: 'Check-In',   Icon: HeartPulse },
  { key: 'resources', label: 'Resources',  Icon: BookOpen },
];

export default function Header({ active, go }) {
  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => go('home')}
          className="flex items-center gap-2 mr-3 text-amber-700 font-semibold hover:text-amber-900 transition-colors"
        >
          <Home size={18} />
          <span className="hidden sm:inline text-sm">Home</span>
        </button>

        <div className="flex items-center gap-1.5 mr-4">
          <MessageCircle size={18} className="text-amber-500" />
          <span className="font-bold text-stone-800 text-sm">Social Connect</span>
        </div>

        <nav className="flex gap-1 flex-wrap">
          {NAV.map(({ key, label, Icon }) => (
            <motion.button
              key={key}
              onClick={() => go(key)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                active === key
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              <Icon size={13} />
              {label}
            </motion.button>
          ))}
        </nav>
      </div>
    </header>
  );
}
