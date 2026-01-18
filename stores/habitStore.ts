/**
 * Habit Store - Zustand State Management
 *
 * Manages habit logs and streak tracking.
 * Uses local SQLite database for persistence.
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
import { habitRepository } from '../services/database';
import { createLogger } from '../lib/logger';

const logger = createLogger('[HabitStore]');

interface HabitStreak {
  habitType: HabitType;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
}

interface HabitState {
  // State
  todayLogs: HabitLog[];
  todayHabits: HabitLog[];
  allHabits: HabitLog[];
  streaks: Record<HabitType, HabitStreak>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Habit log actions
  fetchTodayLogs: (userId: string) => Promise<void>;
  fetchTodayHabits: (userId: string) => Promise<void>;
  fetchAllHabits: (userId: string) => Promise<void>;
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

const DEFAULT_STREAKS: Record<HabitType, HabitStreak> = {
  weight: { habitType: 'weight', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  hydration: { habitType: 'hydration', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  sleep_duration: { habitType: 'sleep_duration', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  sleep_quality: { habitType: 'sleep_quality', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  mood: { habitType: 'mood', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  bowels: { habitType: 'bowels', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  period_cycle: { habitType: 'period_cycle', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
  five_a_day: { habitType: 'five_a_day', currentStreak: 0, longestStreak: 0, lastLoggedDate: null },
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
  todayHabits: [],
  allHabits: [],
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

    try {
      // Fetch from SQLite
      const logs = habitRepository.getTodayHabitLogs(userId);

      // Calculate streaks for common habits
      const updatedStreaks = { ...DEFAULT_STREAKS };
      const habitTypes: HabitType[] = ['hydration', 'sleep_duration', 'mood', 'five_a_day'];
      
      for (const habitType of habitTypes) {
        const streak = habitRepository.calculateStreak(userId, habitType);
        updatedStreaks[habitType] = {
          habitType,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastLoggedDate: streak.lastLoggedDate,
        };
      }

      set({
        todayLogs: logs,
        streaks: updatedStreaks,
        isLoading: false,
      });

      // If connected to Supabase, sync in background
      if (!isDemoMode()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          // TODO: Implement sync logic
        }
      }
    } catch (error) {
      logger.error(' Fetch error:', error);
      set({ isLoading: false, error: 'Failed to fetch habit logs' });
    }
  },

  // Fetch today's habits (alias for fetchTodayLogs)
  fetchTodayHabits: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const logs = habitRepository.getTodayHabitLogs(userId);
      set({
        todayHabits: logs,
        todayLogs: logs,
        isLoading: false,
      });
    } catch (error) {
      logger.error(' Fetch today habits error:', error);
      set({ isLoading: false, error: 'Failed to fetch today habits' });
    }
  },

  // Fetch all habit logs for timeline
  fetchAllHabits: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const logs = habitRepository.getHabitLogsByUserId(userId);
      set({
        allHabits: logs,
        isLoading: false,
      });
    } catch (error) {
      logger.error(' Fetch all error:', error);
      set({ isLoading: false, error: 'Failed to fetch all habit logs' });
    }
  },

  // Generic habit logging
  logHabit: async (log) => {
    set({ isLoading: true, error: null });

    try {
      // Save to SQLite
      const newLog = habitRepository.createHabitLog(log);

      if (!newLog) {
        set({ isLoading: false, error: 'Failed to create habit log' });
        return false;
      }

      const { todayLogs } = get();
      set({
        todayLogs: [...todayLogs, newLog],
        isLoading: false,
      });

      // If connected to Supabase, also save there
      if (!isDemoMode()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from('habit_logs').insert({
            ...log,
            value: String(log.value),
          });
        }
      }

      return true;
    } catch (error) {
      logger.error(' Log error:', error);
      set({ isLoading: false, error: 'Failed to log habit' });
      return false;
    }
  },

  // Delete habit log
  deleteHabitLog: async (logId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Delete from SQLite
      habitRepository.deleteHabitLog(logId);

      const { todayLogs } = get();
      set({
        todayLogs: todayLogs.filter((log) => log.id !== logId),
        isLoading: false,
      });

      // If connected to Supabase, also delete there
      if (!isDemoMode()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from('habit_logs').delete().eq('id', logId);
        }
      }

      return true;
    } catch (error) {
      logger.error(' Delete error:', error);
      set({ isLoading: false, error: 'Failed to delete habit log' });
      return false;
    }
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
