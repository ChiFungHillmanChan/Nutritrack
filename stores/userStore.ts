/**
 * User Store - Zustand State Management
 * 
 * Manages user authentication state and profile data.
 */

import { create } from 'zustand';
import { User, DailyTargets, UserGoal, MedicalCondition } from '../types';
import { getSupabaseClient } from '../services/supabase';

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (newUser: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth actions
  signIn: (userEmail: string, userPassword: string) => Promise<boolean>;
  signUp: (userEmail: string, userPassword: string) => Promise<boolean>;
  signOut: () => Promise<void>;

  // Profile actions
  updateProfile: (profileUpdates: Partial<User>) => Promise<boolean>;
  calculateDailyTargets: (
    height: number,
    weight: number,
    goal: UserGoal,
    conditions: MedicalCondition[]
  ) => DailyTargets;
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
function calculateBMR(weight: number, height: number, age: number = 30): number {
  // Using average values, can be refined with actual age/gender
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

/**
 * Calculate daily nutrition targets based on user profile
 */
function calculateTargets(
  height: number,
  weight: number,
  goal: UserGoal,
  conditions: MedicalCondition[]
): DailyTargets {
  const bmr = calculateBMR(weight, height);
  const tdee = bmr * 1.55; // Moderate activity level

  // Adjust based on goal
  let calorieTarget: { min: number; max: number };
  switch (goal) {
    case 'lose_weight':
      calorieTarget = { min: tdee - 750, max: tdee - 500 };
      break;
    case 'gain_weight':
    case 'build_muscle':
      calorieTarget = { min: tdee + 300, max: tdee + 500 };
      break;
    default:
      calorieTarget = { min: tdee - 200, max: tdee + 200 };
  }

  // Calculate macros (as percentage of calories)
  const avgCalories = (calorieTarget.min + calorieTarget.max) / 2;

  let proteinTarget = { min: weight * 1.6, max: weight * 2.2 };
  let carbsTarget = { min: avgCalories * 0.4 / 4, max: avgCalories * 0.5 / 4 };
  const fatTarget = { min: avgCalories * 0.2 / 9, max: avgCalories * 0.3 / 9 };
  
  // Adjust for conditions
  let sodiumTarget = { min: 1500, max: 2300 };
  if (conditions.includes('hypertension') || conditions.includes('heart_disease')) {
    sodiumTarget = { min: 1000, max: 1500 };
  }
  if (conditions.includes('kidney_disease')) {
    proteinTarget = { min: weight * 0.6, max: weight * 0.8 };
    sodiumTarget = { min: 1000, max: 1500 };
  }
  if (conditions.includes('diabetes')) {
    carbsTarget = { min: avgCalories * 0.35 / 4, max: avgCalories * 0.45 / 4 };
  }
  
  return {
    calories: {
      min: Math.round(calorieTarget.min),
      max: Math.round(calorieTarget.max),
    },
    protein: {
      min: Math.round(proteinTarget.min),
      max: Math.round(proteinTarget.max),
    },
    carbs: {
      min: Math.round(carbsTarget.min),
      max: Math.round(carbsTarget.max),
    },
    fat: {
      min: Math.round(fatTarget.min),
      max: Math.round(fatTarget.max),
    },
    fiber: { min: 25, max: 35 },
    sodium: sodiumTarget,
    water: weight * 35, // 35ml per kg body weight
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  
  // Basic setters
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Sign in with email/password
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
    
    if (data.user) {
      // Fetch user profile from database
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      set({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },
  
  // Sign up with email/password
  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
    
    if (data.user) {
      set({ isLoading: false });
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },
  
  // Sign out
  signOut: async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return false;
    
    set({ isLoading: true, error: null });
    
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    
    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
    
    set({
      user: { ...user, ...updates },
      isLoading: false,
    });
    return true;
  },
  
  // Calculate daily targets
  calculateDailyTargets: calculateTargets,
}));
