/**
 * Summary types for Nutritrack
 */

import type { DailyTargets } from './user';
import type { NutritionData, FoodLog } from './nutrition';
import type { ExerciseLog, HabitType } from './activity';

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// SUMMARY TYPES
// ============================================

export interface DailySummary {
  date: string;
  consumed: NutritionData;
  burned: number;
  net_calories: number;
  targets: DailyTargets;
  meals: FoodLog[];
  exercises: ExerciseLog[];
  water_ml: number;
  steps: number;
  habits_logged: HabitType[];
}

export interface WeeklySummary {
  start_date: string;
  end_date: string;
  avg_calories_consumed: number;
  avg_calories_burned: number;
  avg_steps: number;
  total_exercises: number;
  weight_change_kg?: number;
  goal_adherence_percentage: number;
}

// ============================================
// ENERGY CALCULATION TYPES
// ============================================

export interface EnergyBalance {
  bmr: number;           // Basal Metabolic Rate
  tdee: number;          // Total Daily Energy Expenditure
  intake: number;        // Calories consumed
  activity_burn: number; // Calories from exercise
  total_burn: number;    // TDEE + activity
  net_balance: number;   // intake - total_burn
  remaining_quota: number;
}
