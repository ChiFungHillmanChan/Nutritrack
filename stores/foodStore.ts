/**
 * Food Store - Zustand State Management
 *
 * Manages food logs and daily nutrition tracking.
 * Uses local SQLite database for persistence.
 * Supports DEMO MODE when Supabase is not configured.
 */

import { create } from 'zustand';
import { FoodLog, NutritionData } from '../types';
import { getSupabaseClient, isDemoMode } from '../services/supabase';
import { foodRepository } from '../services/database';

interface FoodState {
  // State
  todayLogs: FoodLog[];
  allLogs: FoodLog[];
  todayNutrition: NutritionData;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Food log actions
  fetchTodayLogs: (userId: string) => Promise<void>;
  fetchAllLogs: (userId: string) => Promise<void>;
  addFoodLog: (log: Omit<FoodLog, 'id'>) => Promise<boolean>;
  deleteFoodLog: (logId: string) => Promise<boolean>;
  updateFoodLog: (logId: string, updates: Partial<FoodLog>) => Promise<boolean>;

  // Helper
  calculateTotalNutrition: (logs: FoodLog[]) => NutritionData;
}

const emptyNutrition: NutritionData = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sodium: 0,
};

export const useFoodStore = create<FoodState>((set, get) => ({
  // Initial state
  todayLogs: [],
  allLogs: [],
  todayNutrition: emptyNutrition,
  isLoading: false,
  error: null,

  // Setters
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Calculate total nutrition from logs
  calculateTotalNutrition: (logs: FoodLog[]): NutritionData => {
    return foodRepository.calculateTotalNutrition(logs);
  },

  // Fetch today's food logs
  fetchTodayLogs: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Always fetch from SQLite first (offline-first)
      const logs = foodRepository.getTodayFoodLogs(userId);
      const totalNutrition = foodRepository.calculateTotalNutrition(logs);
      set({
        todayLogs: logs,
        todayNutrition: totalNutrition,
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
      console.error('[FoodStore] Fetch error:', error);
      set({ isLoading: false, error: 'Failed to fetch food logs' });
    }
  },

  // Fetch all food logs for timeline
  fetchAllLogs: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Fetch all logs from SQLite
      const logs = foodRepository.getFoodLogsByUserId(userId);
      set({
        allLogs: logs,
        isLoading: false,
      });
    } catch (error) {
      console.error('[FoodStore] Fetch all error:', error);
      set({ isLoading: false, error: 'Failed to fetch all food logs' });
    }
  },

  // Add a new food log
  addFoodLog: async (log) => {
    set({ isLoading: true, error: null });

    try {
      // Save to SQLite
      const newLog = foodRepository.createFoodLog(log);

      const { todayLogs, calculateTotalNutrition } = get();
      const updatedLogs = [...todayLogs, newLog];

      set({
        todayLogs: updatedLogs,
        todayNutrition: calculateTotalNutrition(updatedLogs),
        isLoading: false,
      });

      // If connected to Supabase, also save there
      if (!isDemoMode()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from('food_logs').insert(log);
        }
      }

      return true;
    } catch (error) {
      console.error('[FoodStore] Add error:', error);
      set({ isLoading: false, error: 'Failed to add food log' });
      return false;
    }
  },

  // Delete a food log
  deleteFoodLog: async (logId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Delete from SQLite
      foodRepository.deleteFoodLog(logId);

      const { todayLogs, calculateTotalNutrition } = get();
      const updatedLogs = todayLogs.filter((log) => log.id !== logId);

      set({
        todayLogs: updatedLogs,
        todayNutrition: calculateTotalNutrition(updatedLogs),
        isLoading: false,
      });

      // If connected to Supabase, also delete there
      if (!isDemoMode()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from('food_logs').delete().eq('id', logId);
        }
      }

      return true;
    } catch (error) {
      console.error('[FoodStore] Delete error:', error);
      set({ isLoading: false, error: 'Failed to delete food log' });
      return false;
    }
  },

  // Update a food log
  updateFoodLog: async (logId: string, updates: Partial<FoodLog>) => {
    set({ isLoading: true, error: null });

    try {
      // Update in SQLite
      const updatedLog = foodRepository.updateFoodLog(logId, updates);
      if (!updatedLog) {
        set({ isLoading: false, error: 'Food log not found' });
        return false;
      }

      const { todayLogs, calculateTotalNutrition } = get();
      const updatedLogs = todayLogs.map((log) => 
        log.id === logId ? updatedLog : log
      );

      set({
        todayLogs: updatedLogs,
        todayNutrition: calculateTotalNutrition(updatedLogs),
        isLoading: false,
      });

      // If connected to Supabase, also update there
      if (!isDemoMode()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from('food_logs').update(updates).eq('id', logId);
        }
      }

      return true;
    } catch (error) {
      console.error('[FoodStore] Update error:', error);
      set({ isLoading: false, error: 'Failed to update food log' });
      return false;
    }
  },
}));
