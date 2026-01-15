/**
 * Food Store - Zustand State Management
 *
 * Manages food logs and daily nutrition tracking.
 * Supports DEMO MODE when Supabase is not configured.
 */

import { create } from 'zustand';
import { FoodLog, NutritionData } from '../types';
import { getSupabaseClient, isDemoMode } from '../services/supabase';

interface FoodState {
  // State
  todayLogs: FoodLog[];
  todayNutrition: NutritionData;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Food log actions
  fetchTodayLogs: (userId: string) => Promise<void>;
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

/**
 * Demo food logs for testing
 */
const DEMO_FOOD_LOGS: FoodLog[] = [
  {
    id: 'demo-log-001',
    user_id: 'demo-user-001',
    meal_type: 'breakfast',
    food_name: '雞蛋三文治',
    portion_size: 200,
    nutrition_data: {
      calories: 350,
      protein: 18,
      carbs: 32,
      fat: 16,
      fiber: 2,
      sodium: 520,
    },
    logged_at: new Date().toISOString(),
    ai_confidence: 0.92,
  },
  {
    id: 'demo-log-002',
    user_id: 'demo-user-001',
    meal_type: 'lunch',
    food_name: '叉燒飯',
    portion_size: 400,
    nutrition_data: {
      calories: 650,
      protein: 28,
      carbs: 85,
      fat: 22,
      fiber: 1,
      sodium: 890,
    },
    logged_at: new Date().toISOString(),
    ai_confidence: 0.88,
  },
];

export const useFoodStore = create<FoodState>((set, get) => ({
  // Initial state
  todayLogs: [],
  todayNutrition: emptyNutrition,
  isLoading: false,
  error: null,

  // Setters
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Calculate total nutrition from logs
  calculateTotalNutrition: (logs: FoodLog[]): NutritionData => {
    return logs.reduce(
      (total, log) => ({
        calories: total.calories + log.nutrition_data.calories,
        protein: total.protein + log.nutrition_data.protein,
        carbs: total.carbs + log.nutrition_data.carbs,
        fat: total.fat + log.nutrition_data.fat,
        fiber: total.fiber + log.nutrition_data.fiber,
        sodium: total.sodium + log.nutrition_data.sodium,
      }),
      { ...emptyNutrition }
    );
  },

  // Fetch today's food logs
  fetchTodayLogs: async (_userId: string) => {
    set({ isLoading: true, error: null });

    // Demo mode - use mock data
    if (isDemoMode()) {
      const totalNutrition = get().calculateTotalNutrition(DEMO_FOOD_LOGS);
      set({
        todayLogs: DEMO_FOOD_LOGS,
        todayNutrition: totalNutrition,
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
      .from('food_logs')
      .select('*')
      .eq('user_id', _userId)
      .gte('logged_at', today.toISOString())
      .lt('logged_at', tomorrow.toISOString())
      .order('logged_at', { ascending: true });

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    const logs = data ?? [];
    const totalNutrition = get().calculateTotalNutrition(logs);

    set({
      todayLogs: logs,
      todayNutrition: totalNutrition,
      isLoading: false,
    });
  },

  // Add a new food log
  addFoodLog: async (log) => {
    set({ isLoading: true, error: null });

    // Demo mode - add to local state only
    if (isDemoMode()) {
      const newLog: FoodLog = {
        ...log,
        id: `demo-log-${Date.now()}`,
      };

      const { todayLogs, calculateTotalNutrition } = get();
      const updatedLogs = [...todayLogs, newLog];

      set({
        todayLogs: updatedLogs,
        todayNutrition: calculateTotalNutrition(updatedLogs),
        isLoading: false,
      });

      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { data, error } = await supabase.from('food_logs').insert(log).select().single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { todayLogs, calculateTotalNutrition } = get();
    const updatedLogs = [...todayLogs, data];

    set({
      todayLogs: updatedLogs,
      todayNutrition: calculateTotalNutrition(updatedLogs),
      isLoading: false,
    });

    return true;
  },

  // Delete a food log
  deleteFoodLog: async (logId: string) => {
    set({ isLoading: true, error: null });

    // Demo mode - delete from local state only
    if (isDemoMode()) {
      const { todayLogs, calculateTotalNutrition } = get();
      const updatedLogs = todayLogs.filter((log) => log.id !== logId);

      set({
        todayLogs: updatedLogs,
        todayNutrition: calculateTotalNutrition(updatedLogs),
        isLoading: false,
      });

      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { error } = await supabase.from('food_logs').delete().eq('id', logId);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { todayLogs, calculateTotalNutrition } = get();
    const updatedLogs = todayLogs.filter((log) => log.id !== logId);

    set({
      todayLogs: updatedLogs,
      todayNutrition: calculateTotalNutrition(updatedLogs),
      isLoading: false,
    });

    return true;
  },

  // Update a food log
  updateFoodLog: async (logId: string, updates: Partial<FoodLog>) => {
    set({ isLoading: true, error: null });

    // Demo mode - update local state only
    if (isDemoMode()) {
      const { todayLogs, calculateTotalNutrition } = get();
      const updatedLogs = todayLogs.map((log) => (log.id === logId ? { ...log, ...updates } : log));

      set({
        todayLogs: updatedLogs,
        todayNutrition: calculateTotalNutrition(updatedLogs),
        isLoading: false,
      });

      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { error } = await supabase.from('food_logs').update(updates).eq('id', logId);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { todayLogs, calculateTotalNutrition } = get();
    const updatedLogs = todayLogs.map((log) => (log.id === logId ? { ...log, ...updates } : log));

    set({
      todayLogs: updatedLogs,
      todayNutrition: calculateTotalNutrition(updatedLogs),
      isLoading: false,
    });

    return true;
  },
}));
