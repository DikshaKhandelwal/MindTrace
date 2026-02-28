export const CATEGORY_META = {
  anxiety:       { label: 'Anxiety',       bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400',   border: 'border-blue-200'   },
  grief:         { label: 'Grief',         bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400', border: 'border-purple-200' },
  relationships: { label: 'Relationships', bg: 'bg-rose-100',   text: 'text-rose-700',   dot: 'bg-rose-400',   border: 'border-rose-200'   },
  burnout:       { label: 'Burnout',       bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200'  },
  growth:        { label: 'Growth',        bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-400',   border: 'border-teal-200'   },
  depression:    { label: 'Depression',    bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-400', border: 'border-indigo-200' },
  transitions:   { label: 'Transitions',   bg: 'bg-sky-100',    text: 'text-sky-700',    dot: 'bg-sky-400',    border: 'border-sky-200'    },
  student:       { label: 'Student Life',  bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-400', border: 'border-violet-200' },
};

export const POSTS = [
  {
    id: '1',
    anonymousName: 'Quiet River',
    avatarColor: '#3b82f6',
    timeAgo: '1h ago',
    category: 'anxiety',
    content:
      "I've been waking up with this tight feeling in my chest every morning before I even remember what day it is. It's like my body is already stressed before my mind joins in. Has anyone else dealt with morning anxiety like this? What actually helped you?",
    reactions: { heart: 34, hug: 18, relate: 67 },
    replyCount: 12,
    compassion:
      'That heavy feeling before the day even starts is one of the quieter, lonelier forms of anxiety. Your body is doing its best to protect you — and noticing it, as you are, is already a form of presence.',
  },
  {
    id: '2',
    anonymousName: 'Autumn Leaf',
    avatarColor: '#8b5cf6',
    timeAgo: '3h ago',
    category: 'grief',
    content:
      "It's been six months since I lost my dad. People keep saying it should get easier but some days it hits just as hard as day one. I heard a song he used to hum while cooking today and had to pull over and just sit. I miss him so much.",
    reactions: { heart: 89, hug: 73, relate: 41 },
    replyCount: 28,
    compassion:
      "Grief doesn't follow anyone else's schedule. A song, a scent, a quiet moment — love finds its way back through the smallest things. The fact that he lives in those moments is its own kind of beautiful.",
  },
  {
    id: '3',
    anonymousName: 'Mountain Echo',
    avatarColor: '#f59e0b',
    timeAgo: '5h ago',
    category: 'burnout',
    content:
      "I used to love my job. I'd come home excited about what I was building. Now I stare at my screen and can't care no matter how hard I try. My manager praised me in a meeting today and I just felt... nothing. When did I become this hollow?",
    reactions: { heart: 56, hug: 44, relate: 112 },
    replyCount: 19,
    compassion:
      'Feeling hollow when everything looks fine from the outside can be the loneliest kind of exhaustion. You haven\'t lost who you are — your mind and body are just asking, loudly, for something to change.',
  },
  {
    id: '4',
    anonymousName: 'Silver Thread',
    avatarColor: '#14b8a6',
    timeAgo: '7h ago',
    category: 'growth',
    content:
      'Six months into therapy and I finally set a limit with my mum that I\'ve needed to set for years. She got upset, and I felt guilty — but also somehow proud? Like I was finally being honest. I cried after the call but in a good way. Progress isn\'t always comfortable.',
    reactions: { heart: 143, hug: 67, relate: 88 },
    replyCount: 34,
    compassion:
      'That moment of holding your own even when it stings — that\'s not a small thing. The guilt and the pride sitting side by side is exactly what growth feels like. You showed up for yourself.',
  },
  {
    id: '5',
    anonymousName: 'Still Lake',
    avatarColor: '#6366f1',
    timeAgo: '10h ago',
    category: 'depression',
    content:
      "The hard part isn't always the big sad. Sometimes it's just endless grey. Can't cry, can't laugh. Movies I loved feel flat. Food doesn't taste like much. I'm functional but I feel like I'm going through motions.",
    reactions: { heart: 78, hug: 91, relate: 134 },
    replyCount: 22,
    compassion:
      'The grey is harder to name than the storm, and that makes it harder to ask for help. But grey is still something — and you reaching out, even to say this, is you still here and still wanting more.',
  },
  {
    id: '6',
    anonymousName: 'Open Road',
    avatarColor: '#0ea5e9',
    timeAgo: '12h ago',
    category: 'transitions',
    content:
      'Moved to a new city for work three months ago. Everyone said it would be exciting. Maybe it is for some people. For me it\'s quiet evenings wondering if I made a mistake. My apartment still echoes. I haven\'t made a single real friend yet.',
    reactions: { heart: 47, hug: 62, relate: 83 },
    replyCount: 15,
    compassion:
      'Three months in a new place with no roots yet — that echo is real, and it\'s okay that it hurts. Building a life somewhere takes longer than anyone warns you about. You\'re still in the beginning.',
  },
  {
    id: '7',
    anonymousName: 'Willow Bend',
    avatarColor: '#ec4899',
    timeAgo: '14h ago',
    category: 'relationships',
    content:
      "I keep shrinking myself in conversations so the other person feels better. I say 'it's fine' when it isn't, I laugh things off that actually hurt me. I know I do it but I can't seem to stop. When did I decide my feelings were less important?",
    reactions: { heart: 92, hug: 55, relate: 147 },
    replyCount: 31,
    compassion:
      'The pattern of making yourself smaller to keep the peace often starts long before we can name it. The fact that you can see it now means you\'re already standing a little taller.',
  },
  {
    id: '8',
    anonymousName: 'Fern Hill',
    avatarColor: '#7c3aed',
    timeAgo: '1d ago',
    category: 'student',
    content:
      "Finals week and I haven't slept properly in five days. Everyone in my dorm seems to be doing fine and I'm barely holding it together. I keep thinking if I was smarter or more disciplined I wouldn't struggle like this.",
    reactions: { heart: 65, hug: 48, relate: 97 },
    replyCount: 17,
    compassion:
      'Everyone else looking okay is one of the most persistent myths of student life. They\'re comparing their insides to your outsides too. Five days of poor sleep would unravel anyone — this is not a failure of intelligence.',
  },
];

export const ANON_NAMES = [
  'Quiet River', 'Autumn Leaf', 'Mountain Echo', 'Silver Thread', 'Still Lake',
  'Fern Hill', 'Willow Bend', 'Open Road', 'Gentle Storm', 'Bright Moss',
  'Coastal Wind', 'Birch Grove', 'Morning Tide', 'Stone Path', 'Dusk Meadow',
];

export const ANON_COLORS = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#14b8a6', '#6366f1',
  '#ec4899', '#0ea5e9', '#7c3aed', '#10b981', '#f97316',
];
