/**
 * User Store - Zustand State Management
 *
 * Manages user authentication state and profile data.
 * Supports DEMO MODE when Supabase is not configured.
 */

import { create } from 'zustand';
import {
  User,
  DailyTargets,
  UserGoal,
  HealthGoal,
  MedicalCondition,
  Gender,
  ActivityLevel,
} from '../types';
import { getSupabaseClient, isDemoMode } from '../services/supabase';

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  error: string | null;

  // Actions
  setUser: (newUser: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth actions
  signIn: (userEmail: string, userPassword: string) => Promise<boolean>;
  signUp: (userEmail: string, userPassword: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;

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
 * Demo user for testing without Supabase
 */
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@nutritrack.app',
  name: '示範用戶',
  gender: 'prefer_not_to_say',
  date_of_birth: '1990-01-01',
  height_cm: 170,
  weight_kg: 65,
  activity_level: 'moderate',
  goal: 'maintain',
  health_goals: ['healthy_balanced_eating', 'improve_hydration'],
  medical_conditions: [],
  medications: [],
  supplements: [],
  allergies: [],
  dietary_preferences: [],
  daily_targets: {
    calories: { min: 1800, max: 2200 },
    protein: { min: 104, max: 143 },
    carbs: { min: 200, max: 275 },
    fat: { min: 44, max: 73 },
    fiber: { min: 25, max: 35 },
    sodium: { min: 1500, max: 2300 },
    water: 2275,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
function calculateBMR(
  weight: number,
  height: number,
  age: number = 30,
  gender: Gender = 'prefer_not_to_say'
): number {
  // Mifflin-St Jeor Equation
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  
  switch (gender) {
    case 'male':
      return baseBMR + 5;
    case 'female':
      return baseBMR - 161;
    default:
      // Use average for other/prefer_not_to_say
      return baseBMR - 78;
  }
}

/**
 * Get activity multiplier for TDEE calculation
 */
function getActivityMultiplier(activityLevel: ActivityLevel = 'moderate'): number {
  switch (activityLevel) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'active':
      return 1.725;
    case 'very_active':
      return 1.9;
    default:
      return 1.55;
  }
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
  error: null,

  // Basic setters
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Enter demo mode with mock user
  enterDemoMode: () => {
    set({
      user: DEMO_USER,
      isAuthenticated: true,
      isDemoMode: true,
      isLoading: false,
      error: null,
    });
  },

  // Sign in with email/password
  signIn: async (email, password) => {
    // Demo mode - auto login
    if (isDemoMode()) {
      set({
        user: { ...DEMO_USER, email },
        isAuthenticated: true,
        isDemoMode: true,
        isLoading: false,
      });
      return true;
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
      // Fetch user profile from database
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Merge with defaults for new fields
      const userProfile: User = {
        ...DEMO_USER, // Default values
        ...profile,
        health_goals: profile?.health_goals || [],
        medications: profile?.medications || [],
        supplements: profile?.supplements || [],
        allergies: profile?.allergies || [],
        dietary_preferences: profile?.dietary_preferences || [],
      };

      set({
        user: userProfile,
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
    // Demo mode - auto signup
    if (isDemoMode()) {
      set({
        user: { ...DEMO_USER, email },
        isAuthenticated: true,
        isDemoMode: true,
        isLoading: false,
      });
      return true;
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
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ user: null, isAuthenticated: false });
  },

  // Update user profile
  updateProfile: async (updates) => {
    const { user, isDemoMode: isDemo } = get();
    if (!user) return false;

    // Demo mode - just update local state
    if (isDemo) {
      set({
        user: { ...user, ...updates, updated_at: new Date().toISOString() },
        isLoading: false,
      });
      return true;
    }

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

    set({
      user: { ...user, ...updates },
      isLoading: false,
    });
    return true;
  },

  // Calculate daily targets with full parameters
  calculateDailyTargets: (params: TargetCalculationParams) => calculateTargets(params),
}));

// Export helper functions for use in components
export { calculateAge, calculateBMR, getActivityMultiplier };
