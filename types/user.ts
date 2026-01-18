/**
 * User profile types for Nutritrack
 */

import type { NotificationSettings } from './notification';

// ============================================
// USER PROFILE TYPES
// ============================================

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

// Expanded health goals (13 options as per spec)
export type HealthGoal =
  | 'healthy_balanced_eating'
  | 'weight_loss'
  | 'weight_gain'
  | 'healthy_bowels'
  | 'muscle_gain'
  | 'improve_hydration'
  | 'blood_sugar_control'
  | 'fix_micros'
  | 'improve_sleep'
  | 'improve_breathing'
  | 'reduce_alcohol'
  | 'reduce_smoking'
  | 'achieve_10k_steps'
  | 'improve_mental_health';

// Legacy goal type for backward compatibility
export type UserGoal = 'lose_weight' | 'gain_weight' | 'maintain' | 'build_muscle';

// Expanded medical conditions
export type MedicalCondition =
  | 'none'
  | 'diabetes'
  | 't1dm'
  | 't2dm'
  | 'hypertension'
  | 'heart_disease'
  | 'coronary_heart_disease'
  | 'high_cholesterol'
  | 'kidney_disease'
  | 'celiac_disease'
  | 'lactose_intolerance'
  | 'copd'
  | 'asthma'
  | 'cancer'
  | 'pcos'
  | 'thyroid_disorders'
  | 'ibs'
  | 'crohns_disease'
  | 'ulcerative_colitis';

// Dietary preferences
export type DietaryPreference =
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'halal'
  | 'kosher'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'low_sodium'
  | 'low_carb'
  | 'keto';

// Medication/Supplement entry
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[];
  notes?: string;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
}

// Enhanced User type
export interface User {
  id: string;
  email: string;
  name: string;
  gender?: Gender;
  date_of_birth?: string;
  height_cm: number;
  weight_kg: number;
  activity_level?: ActivityLevel;
  goal: UserGoal;
  health_goals: HealthGoal[];
  medical_conditions: MedicalCondition[];
  medications: Medication[];
  onboarding_completed?: boolean;
  supplements: Supplement[];
  allergies: string[];
  dietary_preferences: DietaryPreference[];
  daily_targets: DailyTargets;
  notification_settings?: NotificationSettings;
  created_at: string;
  updated_at: string;
}

export interface DailyTargets {
  calories: { min: number; max: number };
  protein: { min: number; max: number };    // grams
  carbs: { min: number; max: number };      // grams
  fat: { min: number; max: number };        // grams
  fiber: { min: number; max: number };      // grams
  sodium: { min: number; max: number };     // mg
  water: number;                             // ml
  // Micronutrients
  iron?: { min: number; max: number };      // mg
  calcium?: { min: number; max: number };   // mg
  vitamin_d?: { min: number; max: number }; // mcg
  vitamin_b12?: { min: number; max: number }; // mcg
  potassium?: { min: number; max: number }; // mg
}
