export const moodSeries = [
  { time: 'Mon', mood: 6 },
  { time: 'Tue', mood: 7 },
  { time: 'Wed', mood: 8 },
  { time: 'Thu', mood: 7 },
  { time: 'Fri', mood: 8 },
  { time: 'Sat', mood: 7 },
  { time: 'Sun', mood: 8 },
]

export const recentReflections = [
  { id: '1', date: '2025-10-21', title: 'Morning reset', excerpt: 'Felt calmer after a short walk and breathing.' },
  { id: '2', date: '2025-10-23', title: 'Learning clarity', excerpt: 'Realized context switching drains my focus. Planning blocks helped.' },
  { id: '3', date: '2025-10-25', title: 'Gratitude', excerpt: 'Appreciate small wins and clear thinking time.' },
]

export const keywords = ['planning', 'gratitude', 'breathing', 'focus', 'journal']

// Archive mock data
export type Profile = {
  id: string
  name: string
  summary: string
  tags: string[]
  lastActive: string
  insights?: string[]
  about?: string
  strengths?: string[]
  preferences?: string[]
  supports?: string[]
}

export type Conversation = {
  id: string
  profileId: string
  title: string
  date: string
  snippet: string
  messageCount: number
  tags?: string[]
}

export const profiles: Profile[] = [
  {
    id: 'p1',
    name: 'Jane Doe',
    summary: 'A thoughtful creative balancing ambition with wellbeing; exploring mindful focus and gentle routines.',
    tags: ['design', 'rituals', 'focus'],
    lastActive: '2025-10-26',
    insights: [
      'Feels most centered after a simple morning ritual and a brief walk',
      'Visual planning boards feel lighter than dense task lists',
      'Micro-stalls happen during tool switching; soft cues reduce friction',
    ],
    about: 'Jane enjoys calm mornings, sketching ideas before screens, and gentle structure that leaves room for spontaneity.',
    strengths: ['Kind attention to detail', 'Curiosity and willingness to iterate', 'Resilience after setbacks'],
    preferences: ['Short planning sessions', 'Clear visual cues', 'Warm, encouraging tone'],
    supports: ['Morning breath + stretch', 'Pomodoro with soft edges (45/10)', 'End-of-day gratitude line'],
  },
  {
    id: 'p2',
    name: 'Noah Patel',
    summary: 'Student researching learning clarity and spaced repetition.',
    tags: ['learning', 'memory', 'planning'],
    lastActive: '2025-10-25',
    insights: [
      '45/10 cycles improved recall consistency',
      'Benefits from end-session retrieval questions',
    ],
  },
  {
    id: 'p3',
    name: 'Mia Chen',
    summary: 'Engineer tracking mood-energy cycles to plan deep work.',
    tags: ['engineering', 'energy', 'deep work'],
    lastActive: '2025-10-24',
    insights: [
      'High-energy windows between 9:30-11:30 and 14:00-16:00',
      'Context fragility causes re-entry overhead',
    ],
  },
]

export const conversations: Conversation[] = [
  {
    id: 'c1',
    profileId: 'p1',
    title: 'Morning routine audit',
    date: '2025-10-20',
    snippet: 'We mapped a 20-min flow: breath, stretch, plan, then create.',
    messageCount: 18,
    tags: ['rituals', 'planning'],
  },
  {
    id: 'c2',
    profileId: 'p2',
    title: 'Study blocks and recall',
    date: '2025-10-22',
    snippet: 'Adopted 45/10 cycles and end-session retrieval prompts.',
    messageCount: 24,
    tags: ['learning', 'memory'],
  },
  {
    id: 'c3',
    profileId: 'p3',
    title: 'Weekly plan recalibration',
    date: '2025-10-24',
    snippet: 'Rebalanced tasks by energy curves and context fragility.',
    messageCount: 16,
    tags: ['planning', 'energy'],
  },
  {
    id: 'c4',
    profileId: 'p1',
    title: 'Friction log review',
    date: '2025-10-26',
    snippet: 'Identified “micro-stalls” and added reset cues.',
    messageCount: 12,
    tags: ['focus', 'friction'],
  },
]
