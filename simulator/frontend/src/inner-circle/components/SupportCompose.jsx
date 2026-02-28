import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { MOOD_META } from '../data/circle';

// Starter suggestions keyed by [mood][tone]
const STARTER_SUGGESTIONS = {
  low: {
    gentle:     ["Hey, I've been thinking about you. No pressure to reply — just wanted you to know I'm here.",
                 "Hope you're getting some rest. I'm around whenever you want to talk."],
    supportive: ["I noticed you've been quiet lately. I'm here if you need to talk or just vent.",
                 "You don't have to carry this alone. Whenever you're ready, I'm listening."],
    direct:     ["Hey — are you doing okay? I want to check in properly. Can we talk soon?",
                 "Something feels off and I care too much to ignore it. What's going on?"],
  },
  overwhelmed: {
    gentle:     ["Sending you warmth right now. You don't have to figure it all out today.",
                 "Thinking of you. Take your time — I'm not going anywhere."],
    supportive: ["That sounds like a lot all at once. I'm right here with you.",
                 "Overwhelm is real and valid. You don't have to white-knuckle through this alone."],
    direct:     ["I can see you're stretched thin. Talk to me — what's the heaviest thing right now?",
                 "Let's slow this down together. Tell me what's piling up."],
  },
  okay: {
    gentle:     ["Just checking in — how are you really doing these days?",
                 "Haven't caught up in a while. Miss you — how's everything?"],
    supportive: ["How have you been? I want to hear what's actually going on with you.",
                 "Let's catch up. Something tells me there's more than 'okay' going on."],
    direct:     ["Hey, let's schedule a proper call. I want to actually hear how you are.",
                 "What's been keeping you busy? Tell me the real version."],
  },
  great: {
    gentle:     ["So glad things are going well for you. You deserve it.",
                 "Your good energy is contagious — keep going."],
    supportive: ["Love to hear you're doing well. What's been the highlight lately?",
                 "Things sound good on your end! Tell me more."],
    direct:     ["You've been crushing it lately — let's celebrate properly. When are you free?",
                 "Good things deserve to be acknowledged. Really happy for you."],
  },
  silent: {
    gentle:     ["No words needed — just wanted you to know I'm thinking of you.",
                 "Whenever you're ready, I'm here. Take all the time you need."],
    supportive: ["I respect your space. I just wanted to make sure you know the door's open.",
                 "No pressure at all. Just here when you need me."],
    direct:     ["I know you might not feel like talking, but I wanted to reach out anyway.",
                 "Missing you. Whenever you're back, I'm here."],
  },
};

// Tone guard: detect potentially harmful patterns
function analyzeTone(text) {
  if (!text.trim()) return null;
  const t = text.toLowerCase();
  const issues = [];

  if (/you always|you never|your fault|you always do this/i.test(text))
    issues.push({ type: 'accusatory', msg: 'This might come across as accusatory.' });
  if (/fine\.|whatever\.|i guess\.|forget it/i.test(t))
    issues.push({ type: 'passive', msg: 'This tone might read as passive-aggressive.' });
  if (/[A-Z]{5,}/.test(text))
    issues.push({ type: 'intense', msg: 'All-caps words can feel intense or aggressive.' });
  if ((text.match(/!/g) || []).length >= 3)
    issues.push({ type: 'forceful', msg: 'Multiple exclamation marks may feel forceful.' });
  if (/why don't you|why can't you|you should/i.test(text))
    issues.push({ type: 'demanding', msg: 'This phrasing can feel demanding or critical.' });

  return issues.length ? issues : null;
};

// Suggest a rewrite
function rewrite(text) {
  return text
    .replace(/you always/gi, 'sometimes')
    .replace(/you never/gi, 'I feel like')
    .replace(/your fault/gi, 'something that happened')
    .replace(/why don't you/gi, 'would you be open to')
    .replace(/you should/gi, 'maybe it could help to')
    .replace(/!!!+/g, '.')
    .replace(/[A-Z]{5,}/g, match => match[0] + match.slice(1).toLowerCase());
}

const TONES = [
  { key: 'gentle',     label: 'Gentle',     desc: 'Soft, no pressure' },
  { key: 'supportive', label: 'Supportive', desc: 'Warm, I\'m here' },
  { key: 'direct',     label: 'Direct',     desc: 'Clear, let\'s talk' },
];

export default function SupportCompose({ target, members, go }) {
  const [tone, setTone] = useState('gentle');
  const [message, setMessage] = useState('');
  const [issues, setIssues] = useState(null);
  const [rewritten, setRewritten] = useState('');
  const [sent, setSent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const member = target || members[0];
  if (!member) return null;

  const mm = MOOD_META[member?.currentMood || 'okay'];
  const suggestions = (STARTER_SUGGESTIONS[member.currentMood] || STARTER_SUGGESTIONS.okay)[tone];

  useEffect(() => {
    const t = analyzeTone(message);
    setIssues(t);
    if (t) setRewritten(rewrite(message));
    else setRewritten('');
  }, [message]);

  async function generateWithAI() {
    setGenerating(true);
    try {
      const prompt = `Write a single, warm ${tone} message (max 2 sentences) to check in on someone who is feeling ${member.currentMood}. Their support style is "${member.supportStyle}". No emojis. Sound genuinely human.`;
      const { data } = await axios.post('/api/community/submit', {
        content: prompt,
        isVent: false,
        _custom: true,
      });
      setAiResponse(data.compassion || suggestions[0]);
      setMessage(data.compassion || suggestions[0]);
    } catch {
      setMessage(suggestions[0]);
    } finally {
      setGenerating(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inner-card p-10 text-center max-w-sm w-full"
          style={{ boxShadow: '0 0 60px rgba(139,92,246,0.15)' }}
        >
          <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Send size={24} className="text-violet-300" />
          </div>
          <h3 className="text-2xl font-bold text-white/90 mb-2">Sent</h3>
          <p className="text-white/45 mb-6">Your message is on its way to {member.name}.</p>
          <button
            onClick={() => go('dashboard')}
            className="w-full py-3 rounded-2xl bg-white/6 hover:bg-white/10 text-white/60 text-sm font-medium border border-white/8 transition-all"
          >
            Back to Circle
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-12 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Target */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `hsl(${member.avatarHue},50%,28%)`, boxShadow: `0 0 20px ${mm.color}30` }}
          >
            {member.initials}
          </div>
          <div>
            <div className="text-white/45 text-xs mb-0.5">Reaching out to</div>
            <div className="text-2xl font-bold text-white/90">{member.name}</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mm.color }} />
            <span className={`text-sm ${mm.text}`}>{mm.label}</span>
          </div>
        </div>

        {/* Support style reminder */}
        <div className="inner-card px-4 py-3 mb-6 border-l-2 border-violet-500/30">
          <p className="text-white/40 text-sm">{member.responsePattern}</p>
        </div>

        {/* Tone selector */}
        <div className="mb-6">
          <div className="text-xs text-white/35 mb-2.5">Tone</div>
          <div className="flex gap-2">
            {TONES.map(t => (
              <button
                key={t.key}
                onClick={() => setTone(t.key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  tone === t.key
                    ? 'bg-violet-600/30 border-violet-500/50 text-violet-200'
                    : 'bg-white/4 border-white/8 text-white/40 hover:text-white/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-4">
          <div className="text-xs text-white/35 mb-2">Suggestions</div>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setMessage(s)}
                className="w-full text-left inner-card inner-card-hover px-4 py-3 text-sm text-white/55 hover:text-white/80"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* AI generate */}
        <button
          onClick={generateWithAI}
          disabled={generating}
          className="flex items-center gap-2 text-xs text-violet-300/70 hover:text-violet-200 mb-6 transition-colors"
        >
          {generating
            ? <><Loader2 size={12} className="animate-spin" /> Generating...</>
            : <><Sparkles size={12} /> Generate with AI</>
          }
        </button>

        {/* Message input */}
        <div className="mb-4">
          <textarea
            className="w-full bg-white/4 border border-white/8 rounded-2xl p-4 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none min-h-[120px] leading-relaxed"
            placeholder="Write your own message..."
            value={message}
            maxLength={400}
            onChange={e => setMessage(e.target.value)}
          />
          <div className="text-right text-xs text-white/20 mt-1">{message.length}/400</div>
        </div>

        {/* Tone guard */}
        <AnimatePresence>
          {issues && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="inner-card p-4 mb-4 border border-amber-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-400" />
                <div className="text-xs font-semibold text-amber-300">Tone Check</div>
              </div>
              {issues.map((issue, i) => (
                <p key={i} className="text-white/50 text-xs mb-1">{issue.msg}</p>
              ))}
              {rewritten && (
                <div className="mt-3 pt-3 border-t border-white/8">
                  <div className="text-xs text-white/30 mb-1.5">Suggested rewrite</div>
                  <p className="text-white/60 text-sm italic leading-relaxed">"{rewritten}"</p>
                  <button
                    onClick={() => setMessage(rewritten)}
                    className="mt-2 flex items-center gap-1 text-xs text-violet-300/70 hover:text-violet-200 transition-colors"
                  >
                    <ChevronRight size={12} />
                    Use this instead
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send */}
        <button
          onClick={() => message.trim() && setSent(true)}
          disabled={!message.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-violet-600/80 hover:bg-violet-600 text-white font-semibold text-sm transition-all disabled:opacity-30"
          style={{ boxShadow: '0 0 30px rgba(139,92,246,0.2)' }}
        >
          <Send size={16} />
          Send to {member.name}
        </button>
      </motion.div>
    </div>
  );
}
