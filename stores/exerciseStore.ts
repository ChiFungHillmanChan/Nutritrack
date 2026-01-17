/**
 * Exercise Store - Zustand State Management
 *
 * Manages exercise logs, steps, and activity tracking.
 * Integrates with Apple Health / Google Fit when available.
 */

import { create } from 'zustand';
import { ExerciseLog, ExerciseType, DailyActivity } from '../types';
import { getSupabaseClient, isDemoMode } from '../services/supabase';

interface ExerciseState {
  // State
  todayExercises: ExerciseLog[];
  todaySteps: number;
  todayCaloriesBurned: number;
  todayActiveMinutes: number;
  weeklyActivity: DailyActivity[];
  isLoading: boolean;
  error: string | null;
  isHealthConnected: boolean;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHealthConnected: (connected: boolean) => void;

  // Exercise log actions
  fetchTodayExercises: (userId: string) => Promise<void>;
  addExerciseLog: (log: Omit<ExerciseLog, 'id'>) => Promise<boolean>;
  deleteExerciseLog: (logId: string) => Promise<boolean>;
  updateExerciseLog: (logId: string, updates: Partial<ExerciseLog>) => Promise<boolean>;

  // Steps and activity
  updateSteps: (steps: number) => void;
  syncFromHealthApp: (userId: string) => Promise<void>;
  
  // Calculations
  calculateTotalCaloriesBurned: (exercises: ExerciseLog[]) => number;
}

/**
 * Demo exercise logs for testing
 */
const DEMO_EXERCISE_LOGS: ExerciseLog[] = [
  {
    id: 'demo-exercise-001',
    user_id: 'demo-user-001',
    exercise_type: 'walking',
    duration_minutes: 30,
    calories_burned: 120,
    steps: 3500,
    source: 'manual',
    logged_at: new Date().toISOString(),
  },
  {
    id: 'demo-exercise-002',
    user_id: 'demo-user-001',
    exercise_type: 'strength_training',
    duration_minutes: 45,
    calories_burned: 200,
    source: 'manual',
    logged_at: new Date().toISOString(),
  },
];

const DEMO_STEPS = 6500;

/**
 * MET values for exercise calorie calculation
 */
const MET_VALUES: Record<ExerciseType, number> = {
  walking: 3.5,
  running: 9.8,
  cycling: 7.5,
  swimming: 8.0,
  strength_training: 6.0,
  yoga: 3.0,
  hiit: 10.0,
  pilates: 3.5,
  dancing: 5.5,
  hiking: 6.0,
  team_sports: 7.0,
  martial_arts: 7.5,
  climbing: 8.0,
  rowing: 7.0,
  elliptical: 5.0,
  stair_climbing: 8.0,
  stretching: 2.5,
  other: 4.0,
};

/**
 * Calculate calories burned for an exercise
 */
function calculateCalories(
  exerciseType: ExerciseType,
  durationMinutes: number,
  weightKg: number = 70
): number {
  const met = MET_VALUES[exerciseType] || 4.0;
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  todayExercises: [],
  todaySteps: 0,
  todayCaloriesBurned: 0,
  todayActiveMinutes: 0,
  weeklyActivity: [],
  isLoading: false,
  error: null,
  isHealthConnected: false,

  // Setters
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setHealthConnected: (connected) => set({ isHealthConnected: connected }),

  // Calculate total calories from exercises
  calculateTotalCaloriesBurned: (exercises: ExerciseLog[]): number => {
    return exercises.reduce((total, ex) => total + (ex.calories_burned || 0), 0);
  },

  // Fetch today's exercises
  fetchTodayExercises: async (userId: string) => {
    set({ isLoading: true, error: null });

    // Demo mode - use mock data
    if (isDemoMode()) {
      const totalCalories = DEMO_EXERCISE_LOGS.reduce(
        (sum, ex) => sum + (ex.calories_burned || 0),
        0
      );
      const totalMinutes = DEMO_EXERCISE_LOGS.reduce(
        (sum, ex) => sum + ex.duration_minutes,
        0
      );

      set({
        todayExercises: DEMO_EXERCISE_LOGS,
        todaySteps: DEMO_STEPS,
        todayCaloriesBurned: totalCalories,
        todayActiveMinutes: totalMinutes,
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
      .from('exercise_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', today.toISOString())
      .lt('logged_at', tomorrow.toISOString())
      .order('logged_at', { ascending: true });

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    const exercises = data ?? [];
    const totalCalories = exercises.reduce(
      (sum, ex) => sum + (ex.calories_burned || 0),
      0
    );
    const totalMinutes = exercises.reduce(
      (sum, ex) => sum + ex.duration_minutes,
      0
    );
    const totalSteps = exercises.reduce(
      (sum, ex) => sum + (ex.steps || 0),
      0
    );

    set({
      todayExercises: exercises,
      todaySteps: totalSteps,
      todayCaloriesBurned: totalCalories,
      todayActiveMinutes: totalMinutes,
      isLoading: false,
    });
  },

  // Add a new exercise log
  addExerciseLog: async (log) => {
    set({ isLoading: true, error: null });

    // Demo mode - add to local state only
    if (isDemoMode()) {
      const newLog: ExerciseLog = {
        ...log,
        id: `demo-exercise-${Date.now()}`,
      };

      const { todayExercises, calculateTotalCaloriesBurned } = get();
      const updatedExercises = [...todayExercises, newLog];
      const totalMinutes = updatedExercises.reduce(
        (sum, ex) => sum + ex.duration_minutes,
        0
      );

      set({
        todayExercises: updatedExercises,
        todayCaloriesBurned: calculateTotalCaloriesBurned(updatedExercises),
        todayActiveMinutes: totalMinutes,
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
      .from('exercise_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { todayExercises, calculateTotalCaloriesBurned } = get();
    const updatedExercises = [...todayExercises, data];
    const totalMinutes = updatedExercises.reduce(
      (sum, ex) => sum + ex.duration_minutes,
      0
    );

    set({
      todayExercises: updatedExercises,
      todayCaloriesBurned: calculateTotalCaloriesBurned(updatedExercises),
      todayActiveMinutes: totalMinutes,
      isLoading: false,
    });

    return true;
  },

  // Delete an exercise log
  deleteExerciseLog: async (logId: string) => {
    set({ isLoading: true, error: null });

    // Demo mode - delete from local state only
    if (isDemoMode()) {
      const { todayExercises, calculateTotalCaloriesBurned } = get();
      const updatedExercises = todayExercises.filter((ex) => ex.id !== logId);
      const totalMinutes = updatedExercises.reduce(
        (sum, ex) => sum + ex.duration_minutes,
        0
      );

      set({
        todayExercises: updatedExercises,
        todayCaloriesBurned: calculateTotalCaloriesBurned(updatedExercises),
        todayActiveMinutes: totalMinutes,
        isLoading: false,
      });

      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { error } = await supabase.from('exercise_logs').delete().eq('id', logId);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { todayExercises, calculateTotalCaloriesBurned } = get();
    const updatedExercises = todayExercises.filter((ex) => ex.id !== logId);
    const totalMinutes = updatedExercises.reduce(
      (sum, ex) => sum + ex.duration_minutes,
      0
    );

    set({
      todayExercises: updatedExercises,
      todayCaloriesBurned: calculateTotalCaloriesBurned(updatedExercises),
      todayActiveMinutes: totalMinutes,
      isLoading: false,
    });

    return true;
  },

  // Update an exercise log
  updateExerciseLog: async (logId: string, updates: Partial<ExerciseLog>) => {
    set({ isLoading: true, error: null });

    // Demo mode - update local state only
    if (isDemoMode()) {
      const { todayExercises, calculateTotalCaloriesBurned } = get();
      const updatedExercises = todayExercises.map((ex) =>
        ex.id === logId ? { ...ex, ...updates } : ex
      );
      const totalMinutes = updatedExercises.reduce(
        (sum, ex) => sum + ex.duration_minutes,
        0
      );

      set({
        todayExercises: updatedExercises,
        todayCaloriesBurned: calculateTotalCaloriesBurned(updatedExercises),
        todayActiveMinutes: totalMinutes,
        isLoading: false,
      });

      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { error } = await supabase
      .from('exercise_logs')
      .update(updates)
      .eq('id', logId);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    const { todayExercises, calculateTotalCaloriesBurned } = get();
    const updatedExercises = todayExercises.map((ex) =>
      ex.id === logId ? { ...ex, ...updates } : ex
    );
    const totalMinutes = updatedExercises.reduce(
      (sum, ex) => sum + ex.duration_minutes,
      0
    );

    set({
      todayExercises: updatedExercises,
      todayCaloriesBurned: calculateTotalCaloriesBurned(updatedExercises),
      todayActiveMinutes: totalMinutes,
      isLoading: false,
    });

    return true;
  },

  // Update steps count
  updateSteps: (steps: number) => {
    set({ todaySteps: steps });
  },

  // Sync data from health apps (Apple Health / Google Fit)
  syncFromHealthApp: async (_userId: string) => {
    // This will be implemented with actual health API integration
    // For now, it's a placeholder that simulates a sync
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In demo mode, just update with mock data
    if (isDemoMode()) {
      set({
        todaySteps: DEMO_STEPS,
        isHealthConnected: true,
        isLoading: false,
      });
      return;
    }

    // TODO: Implement actual health app integration
    // This requires react-native-health for iOS and react-native-google-fit for Android
    
    set({ isLoading: false });
  },
}));

// Export MET values and calculation function for use elsewhere
export { MET_VALUES, calculateCalories };
