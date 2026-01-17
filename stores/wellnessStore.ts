/**
 * Wellness Store - Zustand State Management
 *
 * Manages meditation sessions, affirmations, and wellness content.
 */

import { create } from 'zustand';
import { MeditationSession, Affirmation } from '../types';
import { getSupabaseClient, isDemoMode } from '../services/supabase';

interface WellnessState {
  // State
  meditationHistory: MeditationSession[];
  affirmations: Affirmation[];
  savedAffirmations: string[]; // IDs of saved affirmations
  dailyAffirmation: Affirmation | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Meditation
  fetchMeditationHistory: (userId: string) => Promise<void>;
  logMeditationSession: (session: Omit<MeditationSession, 'id'>) => Promise<boolean>;
  getTotalMeditationMinutes: () => number;

  // Affirmations
  fetchAffirmations: () => Promise<void>;
  fetchDailyAffirmation: () => Promise<void>;
  saveAffirmation: (userId: string, affirmationId: string) => Promise<boolean>;
  unsaveAffirmation: (userId: string, affirmationId: string) => Promise<boolean>;
}

// Demo affirmations
const DEMO_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'aff-001',
    text: '我今日會做出健康嘅選擇',
    text_zh: '我今日會做出健康嘅選擇',
    category: 'nutrition',
  },
  {
    id: 'aff-002',
    text: '我值得擁有健康嘅身體',
    text_zh: '我值得擁有健康嘅身體',
    category: 'self_love',
  },
  {
    id: 'aff-003',
    text: '每一步都令我更接近目標',
    text_zh: '每一步都令我更接近目標',
    category: 'motivation',
  },
  {
    id: 'aff-004',
    text: '我嘅身體值得被善待',
    text_zh: '我嘅身體值得被善待',
    category: 'self_love',
  },
  {
    id: 'aff-005',
    text: '我有能力改變我嘅習慣',
    text_zh: '我有能力改變我嘅習慣',
    category: 'motivation',
  },
  {
    id: 'aff-006',
    text: '健康係一個旅程，唔係終點',
    text_zh: '健康係一個旅程，唔係終點',
    category: 'mindfulness',
  },
  {
    id: 'aff-007',
    text: '我選擇滋養我嘅身體',
    text_zh: '我選擇滋養我嘅身體',
    category: 'nutrition',
  },
  {
    id: 'aff-008',
    text: '今日我會善待自己',
    text_zh: '今日我會善待自己',
    category: 'self_love',
  },
];

const DEMO_MEDITATION_HISTORY: MeditationSession[] = [
  {
    id: 'med-001',
    user_id: 'demo-user-001',
    type: 'breathing',
    duration_minutes: 5,
    completed: true,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 + 300000).toISOString(),
  },
  {
    id: 'med-002',
    user_id: 'demo-user-001',
    type: 'guided',
    duration_minutes: 10,
    completed: true,
    started_at: new Date(Date.now() - 172800000).toISOString(),
    completed_at: new Date(Date.now() - 172800000 + 600000).toISOString(),
  },
];

export const useWellnessStore = create<WellnessState>((set, get) => ({
  // Initial state
  meditationHistory: [],
  affirmations: [],
  savedAffirmations: [],
  dailyAffirmation: null,
  isLoading: false,
  error: null,

  // Setters
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Get total meditation minutes
  getTotalMeditationMinutes: () => {
    const { meditationHistory } = get();
    return meditationHistory
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.duration_minutes, 0);
  },

  // Fetch meditation history
  fetchMeditationHistory: async (userId: string) => {
    set({ isLoading: true, error: null });

    if (isDemoMode()) {
      set({
        meditationHistory: DEMO_MEDITATION_HISTORY,
        isLoading: false,
      });
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return;
    }

    const { data, error } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({
      meditationHistory: data ?? [],
      isLoading: false,
    });
  },

  // Log meditation session
  logMeditationSession: async (session) => {
    set({ isLoading: true, error: null });

    if (isDemoMode()) {
      const newSession: MeditationSession = {
        ...session,
        id: `med-${Date.now()}`,
      };

      const { meditationHistory } = get();
      set({
        meditationHistory: [newSession, ...meditationHistory],
        isLoading: false,
      });
      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { meditationHistory } = get();
    set({
      meditationHistory: [data, ...meditationHistory],
      isLoading: false,
    });
    return true;
  },

  // Fetch affirmations
  fetchAffirmations: async () => {
    set({ isLoading: true, error: null });

    if (isDemoMode()) {
      set({
        affirmations: DEMO_AFFIRMATIONS,
        isLoading: false,
      });
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return;
    }

    const { data, error } = await supabase
      .from('affirmations')
      .select('*')
      .order('category');

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({
      affirmations: data ?? [],
      isLoading: false,
    });
  },

  // Fetch daily affirmation (random from list)
  fetchDailyAffirmation: async () => {
    const { affirmations } = get();
    
    // If affirmations not loaded, load them first
    if (affirmations.length === 0) {
      await get().fetchAffirmations();
    }

    const currentAffirmations = get().affirmations;
    if (currentAffirmations.length === 0) {
      return;
    }

    // Use date as seed for consistent daily selection
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = dayOfYear % currentAffirmations.length;

    set({ dailyAffirmation: currentAffirmations[index] });
  },

  // Save affirmation
  saveAffirmation: async (userId: string, affirmationId: string) => {
    if (isDemoMode()) {
      const { savedAffirmations } = get();
      if (!savedAffirmations.includes(affirmationId)) {
        set({ savedAffirmations: [...savedAffirmations, affirmationId] });
      }
      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('user_saved_affirmations')
      .insert({ user_id: userId, affirmation_id: affirmationId });

    if (error) return false;

    const { savedAffirmations } = get();
    set({ savedAffirmations: [...savedAffirmations, affirmationId] });
    return true;
  },

  // Unsave affirmation
  unsaveAffirmation: async (userId: string, affirmationId: string) => {
    if (isDemoMode()) {
      const { savedAffirmations } = get();
      set({ savedAffirmations: savedAffirmations.filter((id) => id !== affirmationId) });
      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('user_saved_affirmations')
      .delete()
      .eq('user_id', userId)
      .eq('affirmation_id', affirmationId);

    if (error) return false;

    const { savedAffirmations } = get();
    set({ savedAffirmations: savedAffirmations.filter((id) => id !== affirmationId) });
    return true;
  },
}));
