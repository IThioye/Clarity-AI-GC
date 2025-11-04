import { create } from 'zustand';
import { azureApi, gcpApi } from '@/lib/api/client';
import { sendChatMessage } from '@/lib/api/socket';

// ==========================================================
// 1. useThemeStore (No Changes)
// ==========================================================
type ThemeState = {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  setTheme: (t) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', t === 'dark');
    }
    set({ theme: t });
  },
}));

// ==========================================================
// 2. usePlanStore (API Integrated)
// ==========================================================
type FocusArea = 'Reduce stress' | 'Build gratitude' | 'Improve self-confidence' | 'Better sleep' | 'Focus & clarity' | 'Emotional balance';
export type MicroGoal = { id: string; text: string; area?: FocusArea; done?: boolean };
type Reminder = 'off' | 'daily' | 'weekly';

type PlanState = {
  chosen: Record<string, boolean>;
  focus: FocusArea[];
  goals: MicroGoal[];
  reminder: Reminder;
  updatePlan: (userId: string, patch: Partial<PlanState>) => Promise<void>;
  fetchPlan: (userId: string) => Promise<void>;
  toggle: (id: string) => void;
  setFocus: (focus: FocusArea) => void;
  addGoal: (goal: { text: string; area?: FocusArea }) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
  setReminder: (reminder: Reminder) => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  chosen: {},
  focus: [],
  goals: [],
  reminder: 'off',

  fetchPlan: async (userId: string) => {
    try {
      const prefs = await azureApi.get(`/users/${userId}/preferences`); 
      set({
        // TODO: Frontend team maps API fields to state
        // focus: prefs.primary_direction,
        // goals: prefs.goals,
      });
    } catch (e) {
      console.error("Failed to fetch plan:", e);
    }
  },

  updatePlan: async (userId: string, patch: Partial<PlanState>) => {
    set((state) => ({ ...state, ...patch }));
    try {
      await azureApi.put(`/users/${userId}/preferences`, patch);
    } catch (e) {
      console.error("Failed to save plan:", e);
    }
  },

  toggle: (id: string) => {
    set((state) => ({
      chosen: {
        ...state.chosen,
        [id]: !state.chosen[id],
      },
    }));
  },

  setFocus: (area: FocusArea) => {
    set((state) => ({
      focus: state.focus.includes(area)
        ? state.focus.filter((f) => f !== area)
        : [...state.focus, area],
    }));
  },

  addGoal: (goal: { text: string; area?: FocusArea }) => {
    set((state) => ({
      goals: [
        ...state.goals,
        { ...goal, id: crypto.randomUUID(), done: false },
      ],
    }));
  },

  removeGoal: (id: string) => {
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
  },

  toggleGoal: (id: string) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, done: !g.done } : g
      ),
    }));
  },

  setReminder: (reminder: Reminder) => {
    set({ reminder });
  },
}));

// ==========================================================
// 3. useJournalStore (API Integrated)
// ==========================================================
export type JournalEntry = {
  id: string; 
  content: string; 
  created_at: string; 
  tag?: 'Journal' | 'Conversation';
};

export type MoodEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-10
  note?: string;
};

export type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string; time: string; tag?: 'Conversation' };

type JournalState = {
  journal: JournalEntry[];
  moods: MoodEntry[];
  chat: ChatMessage[];
  fetchJournal: (userId: string) => Promise<void>;
  fetchMoods: (userId: string, journalId: number) => Promise<void>;
  addMood: (mood: number, note?: string) => Promise<void>;
  setChat: (msgs: ChatMessage[]) => void;
  clearChat: () => void;
  addJournal: (content: string) => void;
  removeJournal: (id: string) => void;
  clearJournal: () => void;
};

export const useJournalStore = create<JournalState>((set) => ({
  journal: [],
  moods: [],
  chat: [],

  fetchJournal: async (userId: string) => {
    try {
      const response = await gcpApi.get(`/v1/journal/${userId}`);
      set({ journal: response.entries });
    } catch (e) {
      console.error("Failed to fetch journal:", e);
    }
  },

  fetchMoods: async (userId: string, journalId: number) => {
    try {
      // Using the /insights endpoint as a proxy for moods
      const response = await azureApi.get(`/journals/${journalId}/insights`);
      
      const moods: MoodEntry[] = response.map((insight: any) => ({
        id: insight.id,
        date: new Date(insight.created_at).toISOString().slice(0, 10),
        mood: insight.sentiment_score * 10, // Convert 0.0-1.0 to 0-10
        note: insight.summary,
      }));
      set({ moods });
    } catch (e) {
      console.error("Failed to fetch moods:", e);
    }
  },

  addMood: async (mood: number, note?: string) => {
    const d = new Date();
    const date = d.toISOString().slice(0, 10);
    const tempId = crypto.randomUUID();

    set((s) => ({ 
      moods: [...s.moods, { id: tempId, date, mood, note }] 
    }));
    
    // TODO: Figure out how to get journalId here
    // try {
    //   // Saving a Mood by posting to the /insights endpoint
    //   await azureApi.post(`/insights`, {
    //     journal_id: journalId,
    //     summary: note || '',
    //     sentiment_score: mood / 10, // Convert 1-10 scale to 0.0-1.0
    //     emotion_tags: {},
    //   });
    // } catch (e) {
    //   console.error("Failed to save mood:", e);
    // }
  },

  setChat: (msgs) => {
    set({ chat: msgs });
  },
  
  clearChat: () => {
    set({ chat: [] });
  },

  addJournal: (content: string) => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      content,
      created_at: new Date().toISOString(),
      tag: 'Journal',
    };
    set((state) => ({ journal: [...state.journal, newEntry] }));
    // TODO: Also call an API to persist this
  },

  removeJournal: (id: string) => {
    set((state) => ({
      journal: state.journal.filter((j) => j.id !== id),
    }));
    // TODO: Also call an API to persist this
  },

  clearJournal: () => {
    set({ journal: [], moods: [] });
  },
}));

// ==========================================================
// 4. useOnboardingStore (API Integrated)
// ==========================================================
export type Identity = {
  name?: string
  nickname?: string
  dateOfBirth?: string
  favoriteAnimal?: string
  avatarUrl?: string
}

export type ExperienceSignals = {
  copingPreference?: 'talk' | 'think' | 'distract'
  baselineWord?: 'Calm' | 'Energetic' | 'Reflective' | 'Driven' | 'Sensitive' | 'Steady'
  emotionalGranularity?: number // 1-5
  responseStyle?: 'analyze' | 'retry' | 'talk' | 'avoid' | 'reflect'
  journalingFrequency?: 'never' | 'sometimes' | 'weekly' | 'daily'
  grounding?: 'writing' | 'nature' | 'people' | 'action' | 'art' | 'learning' | 'rest'
}

export type GoalsSignals = {
  direction?: 'Healing' | 'Focus' | 'Growth' | 'Balance' | 'Clarity' | 'Connection'
  helpWith?: ('stress' | 'patterns' | 'creativity' | 'track' | 'plan')[]
  progressPreference?: 'small_wins' | 'deep_insights'
  depthComfort?: number // 1-5
  toneStyle?: 'factual' | 'intuitive'
}

export type InnerWorld = {
  controlOrientation?: 'control' | 'flow'
  selfWords?: string[]
  phrase?: 'analyze' | 'feel' | 'act' | 'share'
  surpriseNote?: string
  archetype?: string
}

export type SpacePrefs = {
  checkIns?: 'daily' | 'ad_hoc'
  guideStyle?: 'reflective_questions' | 'just_listen'
  voiceNotes?: boolean
  mood?: 'cool' | 'warm' | 'balanced'
  toneColor?: 'blue' | 'violet' | 'rose'
}

export type OnboardingState = {
  step: number
  identity: Identity
  experience: ExperienceSignals
  goals: GoalsSignals
  inner: InnerWorld
  space: SpacePrefs
  completed: boolean
  
  fetchOnboardingData: (userId: string) => Promise<void>;
  update: (patch: Partial<OnboardingState>) => Promise<void>;
  complete: () => void;
  setStep: (n: number) => void
  reset: () => void
};

const defaultOnboarding: Omit<OnboardingState, 'setStep' | 'update' | 'fetchOnboardingData' | 'reset' | 'complete'> = {
  step: 0,
  identity: {},
  experience: {},
  goals: {},
  inner: {},
  space: { voiceNotes: false },
  completed: false,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...defaultOnboarding,
  
  setStep: (n) => set({ step: n }),
  
  reset: () => set(defaultOnboarding),

  fetchOnboardingData: async (userId: string) => {
    try {
      const profile = await azureApi.get(`/users/${userId}/profile`);
      const prefs = await azureApi.get(`/users/${userId}/preferences`);
      
      set({
        identity: profile, 
        experience: prefs,
        goals: prefs,
        inner: profile,
        space: prefs,
      });
    } catch (e) {
      console.error("Failed to fetch onboarding data:", e);
    }
  },

  update: async (patch: Partial<OnboardingState>) => {
    set((state) => ({ ...state, ...patch }));

    // Assume a single user for now
    const userId = 'user123';

    try {
      const profileData = { ...get().identity, ...get().inner };
      await azureApi.put(`/users/${userId}/profile`, profileData);
      
      const prefsData = { ...get().experience, ...get().goals, ...get().space };
      await azureApi.put(`/users/${userId}/preferences`, prefsData);
    } catch (e) {
      console.error("Failed to update onboarding data:", e);
    }
  },

  complete: () => set({ completed: true }),
}));