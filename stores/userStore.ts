/**
 * User Store - Zustand State Management
 *
 * Manages user authentication state and profile data.
 * Uses local SQLite database for persistence.
 * Supports DEMO MODE when Supabase is not configured.
 */

import { create } from 'zustand';
import { settingsRepository, userRepository } from '../services/database';
import { getSupabaseClient, isDemoMode } from '../services/supabase';
import {
  calculateBMR,
  getActivityMultiplier,
} from '../lib/energy-calculator';
import { logger } from '../lib/logger';
import {
  ActivityLevel,
  DailyTargets,
  Gender,
  HealthGoal,
  MedicalCondition,
  User,
  UserGoal,
} from '../types';

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setUser: (newUser: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Initialization
  initialize: () => Promise<void>;

  // Auth actions
  signIn: (userEmail: string, userPassword: string) => Promise<boolean>;
  signUp: (userEmail: string, userPassword: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  enterDemoMode: () => Promise<void>;

  // Profile actions
  updateProfile: (profileUpdates: Partial<User>) => Promise<boolean>;
  calculateDailyTargets: (params: TargetCalculationParams) => DailyTargets;
}

interface TargetCalculationParams {
  height: number;
  weight: number;
  age?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  goal: UserGoal;
  healthGoals?: HealthGoal[];
  conditions: MedicalCondition[];
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth?: string): number {
  if (!dateOfBirth) return 30; // Default age
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate daily nutrition targets based on user profile
 */
function calculateTargets(params: TargetCalculationParams): DailyTargets {
  const {
    height,
    weight,
    age = 30,
    gender = 'prefer_not_to_say',
    activityLevel = 'moderate',
    goal,
    healthGoals = [],
    conditions,
  } = params;

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = bmr * getActivityMultiplier(activityLevel);

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

  // Base protein target
  let proteinMultiplierMin = 1.6;
  let proteinMultiplierMax = 2.2;

  // Adjust for muscle gain goal
  if (goal === 'build_muscle' || healthGoals.includes('muscle_gain')) {
    proteinMultiplierMin = 1.8;
    proteinMultiplierMax = 2.4;
  }

  let proteinTarget = { min: weight * proteinMultiplierMin, max: weight * proteinMultiplierMax };
  let carbsTarget = { min: (avgCalories * 0.4) / 4, max: (avgCalories * 0.5) / 4 };
  const fatTarget = { min: (avgCalories * 0.2) / 9, max: (avgCalories * 0.3) / 9 };
  let fiberTarget = { min: 25, max: 35 };

  // Adjust for conditions
  let sodiumTarget = { min: 1500, max: 2300 };
  
  if (conditions.includes('hypertension') || conditions.includes('heart_disease') || conditions.includes('coronary_heart_disease')) {
    sodiumTarget = { min: 1000, max: 1500 };
  }
  
  if (conditions.includes('kidney_disease')) {
    proteinTarget = { min: weight * 0.6, max: weight * 0.8 };
    sodiumTarget = { min: 1000, max: 1500 };
  }
  
  if (conditions.includes('diabetes') || conditions.includes('t1dm') || conditions.includes('t2dm')) {
    // Lower carb for diabetics
    carbsTarget = { min: (avgCalories * 0.35) / 4, max: (avgCalories * 0.45) / 4 };
  }

  // Adjust for health goals
  if (healthGoals.includes('healthy_bowels') || healthGoals.includes('blood_sugar_control')) {
    fiberTarget = { min: 30, max: 40 };
  }

  // Calculate water based on weight and activity
  let waterMultiplier = 35; // ml per kg
  if (activityLevel === 'active' || activityLevel === 'very_active') {
    waterMultiplier = 40;
  }
  if (healthGoals.includes('improve_hydration')) {
    waterMultiplier += 5;
  }

  // Micronutrients (basic targets, can be expanded)
  const ironTarget = gender === 'female' ? { min: 18, max: 27 } : { min: 8, max: 11 };
  const calciumTarget = age > 50 ? { min: 1200, max: 1500 } : { min: 1000, max: 1200 };

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
    fiber: fiberTarget,
    sodium: sodiumTarget,
    water: weight * waterMultiplier,
    iron: ironTarget,
    calcium: calciumTarget,
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isDemoMode: isDemoMode(),
  isInitialized: false,
  error: null,

  // Basic setters
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Initialize from SQLite database
  initialize: async () => {
    try {
      // Check if user is logged in from settings
      const isLoggedIn = settingsRepository.isUserLoggedIn();
      const currentUserId = settingsRepository.getCurrentUserId();

      if (isLoggedIn && currentUserId) {
        // Get the user from SQLite (async due to decryption)
        const existingUser = await userRepository.getUserById(currentUserId);

        if (existingUser) {
          set({
            user: existingUser,
            isAuthenticated: true,
            isDemoMode: true, // Local users are always in "demo" mode (no cloud)
            isInitialized: true,
          });
        } else {
          // User ID in settings but not in database - clear login state
          settingsRepository.setLoginState(false, null);
          set({ isInitialized: true });
        }
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      logger.error('[UserStore] Initialize error:', error);
      set({ isInitialized: true });
    }
  },

  // Enter demo mode with user from SQLite
  enterDemoMode: async () => {
    try {
      // Get or create demo user in SQLite (async due to encryption)
      const demoUser = await userRepository.getDemoUser();

      // Save login state to settings
      settingsRepository.setLoginState(true, demoUser.id);

      set({
        user: demoUser,
        isAuthenticated: true,
        isDemoMode: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      logger.error('[UserStore] Enter demo mode error:', error);
      set({ error: 'Failed to enter demo mode' });
    }
  },

  // Sign in with email/password
  signIn: async (email, password) => {
    // Demo mode (no Supabase) - use local SQLite
    if (isDemoMode()) {
      try {
        // Check if user exists in SQLite (async due to decryption)
        let user = await userRepository.getUserByEmail(email);

        if (!user) {
          // Create user in SQLite for demo mode
          const demoUser = await userRepository.getDemoUser();
          user = await userRepository.updateUser(demoUser.id, { email });
        }

        // Save login state to settings
        settingsRepository.setLoginState(true, user!.id);

        set({
          user: user!,
          isAuthenticated: true,
          isDemoMode: true,
          isLoading: false,
        });
        return true;
      } catch (error) {
        logger.error('[UserStore] Sign in error:', error);
        set({ error: 'Sign in failed' });
        return false;
      }
    }

    set({ isLoading: true, error: null });

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    if (data.user) {
      // Fetch user profile from Supabase database
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        // Also save to local SQLite for offline access (async due to encryption)
        const localUser = await userRepository.getUserById(data.user.id);
        if (!localUser) {
          await userRepository.createUser(profile);
        } else {
          await userRepository.updateUser(data.user.id, profile);
        }

        set({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
    }

    set({ isLoading: false });
    return false;
  },

  // Sign up with email/password
  signUp: async (email, password) => {
    // Demo mode - create user in SQLite
    if (isDemoMode()) {
      try {
        const demoUser = await userRepository.getDemoUser();
        const user = await userRepository.updateUser(demoUser.id, { email });

        // Save login state to settings
        settingsRepository.setLoginState(true, user!.id);

        set({
          user: user!,
          isAuthenticated: true,
          isDemoMode: true,
          isLoading: false,
        });
        return true;
      } catch (error) {
        logger.error('[UserStore] Sign up error:', error);
        set({ error: 'Sign up failed' });
        return false;
      }
    }

    set({ isLoading: true, error: null });

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

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
    // Clear login state from settings
    settingsRepository.setLoginState(false, null);
    
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ user: null, isAuthenticated: false, isDemoMode: false });
  },

  // Update user profile
  updateProfile: async (updates) => {
    const { user, isDemoMode: isDemo } = get();
    if (!user) return false;

    // Update in SQLite (always, for offline access, async due to encryption)
    try {
      const updatedUser = await userRepository.updateUser(user.id, updates);
      if (updatedUser) {
        set({ user: updatedUser });
      }
    } catch (error) {
      logger.error('[UserStore] SQLite update error:', error);
    }

    // If in demo mode, we're done
    if (isDemo) {
      return true;
    }

    // Also update in Supabase if connected
    set({ isLoading: true, error: null });

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isLoading: false, error: 'Supabase not configured' });
      return false;
    }

    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    set({ isLoading: false });
    return true;
  },

  // Calculate daily targets with full parameters
  calculateDailyTargets: (params: TargetCalculationParams) => calculateTargets(params),
}));

// Export helper functions for use in components
// Export calculateAge from this file, re-export BMR/activity functions from energy-calculator
export { calculateAge };
export { calculateBMR, getActivityMultiplier } from '../lib/energy-calculator';
