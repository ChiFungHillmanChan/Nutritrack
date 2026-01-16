/**
 * Habit Store - Zustand State Management
 *
 * Manages habit logs and streak tracking.
 */

import { create } from 'zustand';
import {
  HabitLog,
  HabitType,
  MoodLevel,
  BristolStoolType,
  SleepQuality,
  PeriodFlowLevel,
} from '../types';
import { getSupabaseClient, isDemoMode } from '../services/supabase';

interface HabitStreak {
  habitType: HabitType;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
}

interface HabitState {
  // State
  todayLogs: HabitLog[];
  streaks: Record<HabitType, HabitStreak>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Habit log actions
  fetchTodayLogs: (userId: string) => Promise<void>;
  logHabit: (log: Omit<HabitLog, 'id'>) => Promise<boolean>;
  deleteHabitLog: (logId: string) => Promise<boolean>;

  // Specific habit helpers
  logWeight: (userId: string, weight: number, notes?: string) => Promise<boolean>;
  logHydration: (userId: string, ml: number) => Promise<boolean>;
  logSleep: (userId: string, hours: number, quality?: SleepQuality) => Promise<boolean>;
  logMood: (userId: string, mood: MoodLevel, notes?: string) => Promise<boolean>;
  logBowels: (userId: string, type: BristolStoolType, notes?: string) => Promise<boolean>;
  logPeriod: (userId: string, flow: PeriodFlowLevel, symptoms?: string[]) => Promise<boolean>;
  logFiveADay: (userId: string, servings: number) => Promise<boolean>;

  // Get today's log for a specific habit
  getTodayLog: (habitType: HabitType) => HabitLog | undefined;
  getTodayHydration: () => number;
}

/**
 * Demo habit logs
 */
const DEMO_HABIT_LOGS: HabitLog[] = [
  {
    id: 'demo-habit-001',
    user_id: 'demo-user-001',
    habit_type: 'hydration',
    value: 1500,
    unit: 'ml',
    logged_at: new Date().toISOString(),
  },
  {
    id: 'demo-habit-002',
    user_id: 'demo-user-001',
    habit_type: 'mood',
    value: 4,
    logged_at: new Date().toISOString(),
  },
  {
    id: 'demo-habit-003',
    user_id: 'demo-user-001',
    habit_type: 'sleep_duration',
    value: 7.5,
    unit: 'hours',
    logged_at: new Date().toISOString(),
  },
];

const DEFAULT_STREAKS: Record<HabitType, HabitStreak> = {
  weight: { habitType: 'weight', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  hydration: { habitType: 'hydration', currentStreak: 3, longestStreak: 7, lastLoggedDate: new Date().toISOString() },
  sleep_duration: { habitType: 'sleep_duration', currentStreak: 5, longestStreak: 12, lastLoggedDate: new Date().toISOString() },
  sleep_quality: { habitType: 'sleep_quality', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  mood: { habitType: 'mood', currentStreak: 2, longestStreak: 5, lastLoggedDate: new Date().toISOString() },
  bowels: { habitType: 'bowels', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  period_cycle: { habitType: 'period_cycle', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  five_a_day: { habitType: 'five_a_day', currentStreak: 1, longestStreak: 3, lastLoggedDate: new Date().toISOString() },
  steps: { habitType: 'steps', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  medication_taken: { habitType: 'medication_taken', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  supplement_taken: { habitType: 'supplement_taken', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  alcohol: { habitType: 'alcohol', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  smoking: { habitType: 'smoking', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  custom: { habitType: 'custom', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
};

export const useHabitStore = create<HabitState>((set, get) => ({
  // Initial state
  todayLogs: [],
  streaks: DEFAULT_STREAKS,
  isLoading: false,
  error: null,

  // Setters
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Get today's log for a specific habit
  getTodayLog: (habitType: HabitType) => {
    const { todayLogs } = get();
    return todayLogs.find((log) => log.habit_type === habitType);
  },

  // Get total hydration for today
  getTodayHydration: () => {
    const { todayLogs } = get();
    return todayLogs
      .filter((log) => log.habit_type === 'hydration')
      .reduce((sum, log) => sum + (Number(log.value) || 0), 0);
  },

  // Fetch today's habit logs
  fetchTodayLogs: async (userId: string) => {
    set({ isLoading: true, error: null });

    // Demo mode
    if (isDemoMode()) {
      set({
        todayLogs: DEMO_HABIT_LOGS,
        isLoading: false,
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return;
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', today.toISOString())
      .lt('logged_at', tomorrow.toISOString())
      .order('logged_at', { ascending: true });

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({
      todayLogs: data ?? [],
      isLoading: false,
    });
  },

  // Generic habit logging
  logHabit: async (log) => {
    set({ isLoading: true, error: null });

    // Demo mode
    if (isDemoMode()) {
      const newLog: HabitLog = {
        ...log,
        id: `demo-habit-${Date.now()}`,
      };

      const { todayLogs } = get();
      set({
        todayLogs: [...todayLogs, newLog],
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
      .from('habit_logs')
      .insert({
        ...log,
        value: String(log.value), // Convert to string for database
      })
      .select()
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { todayLogs } = get();
    set({
      todayLogs: [...todayLogs, data],
      isLoading: false,
    });
    return true;
  },

  // Delete habit log
  deleteHabitLog: async (logId: string) => {
    set({ isLoading: true, error: null });

    // Demo mode
    if (isDemoMode()) {
      const { todayLogs } = get();
      set({
        todayLogs: todayLogs.filter((log) => log.id !== logId),
        isLoading: false,
      });
      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { error } = await supabase.from('habit_logs').delete().eq('id', logId);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { todayLogs } = get();
    set({
      todayLogs: todayLogs.filter((log) => log.id !== logId),
      isLoading: false,
    });
    return true;
  },

  // Specific habit helpers
  logWeight: async (userId: string, weight: number, notes?: string) => {
    return get().logHabit({
      user_id: userId,
      habit_type: 'weight',
      value: weight,
      unit: 'kg',
      notes,
      logged_at: new Date().toISOString(),
    });
  },

  logHydration: async (userId: string, ml: number) => {
    return get().logHabit({
      user_id: userId,
      habit_type: 'hydration',
      value: ml,
      unit: 'ml',
      logged_at: new Date().toISOString(),
    });
  },

  logSleep: async (userId: string, hours: number, quality?: SleepQuality) => {
    const result = await get().logHabit({
      user_id: userId,
      habit_type: 'sleep_duration',
      value: hours,
      unit: 'hours',
      notes: quality,
      logged_at: new Date().toISOString(),
    });

    if (quality) {
      await get().logHabit({
        user_id: userId,
        habit_type: 'sleep_quality',
        value: quality,
        logged_at: new Date().toISOString(),
      });
    }

    return result;
  },

  logMood: async (userId: string, mood: MoodLevel, notes?: string) => {
    return get().logHabit({
      user_id: userId,
      habit_type: 'mood',
      value: mood,
      notes,
      logged_at: new Date().toISOString(),
    });
  },

  logBowels: async (userId: string, type: BristolStoolType, notes?: string) => {
    return get().logHabit({
      user_id: userId,
      habit_type: 'bowels',
      value: type,
      notes,
      logged_at: new Date().toISOString(),
    });
  },

  logPeriod: async (userId: string, flow: PeriodFlowLevel, symptoms?: string[]) => {
    return get().logHabit({
      user_id: userId,
      habit_type: 'period_cycle',
      value: flow,
      notes: symptoms?.join(', '),
      logged_at: new Date().toISOString(),
    });
  },

  logFiveADay: async (userId: string, servings: number) => {
    return get().logHabit({
      user_id: userId,
      habit_type: 'five_a_day',
      value: servings,
      unit: 'servings',
      logged_at: new Date().toISOString(),
    });
  },
}));
