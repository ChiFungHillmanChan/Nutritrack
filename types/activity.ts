/**
 * Exercise and habit tracking types for Nutritrack
 */

// ============================================
// EXERCISE & ACTIVITY TYPES
// ============================================

export type ExerciseType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'strength_training'
  | 'yoga'
  | 'hiit'
  | 'pilates'
  | 'dancing'
  | 'hiking'
  | 'team_sports'
  | 'martial_arts'
  | 'climbing'
  | 'rowing'
  | 'elliptical'
  | 'stair_climbing'
  | 'stretching'
  | 'other';

export type ExerciseSource = 'manual' | 'apple_health' | 'google_fit';

export interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_type: ExerciseType;
  duration_minutes: number;
  calories_burned: number;
  distance_km?: number;
  steps?: number;
  avg_heart_rate?: number;
  source: ExerciseSource;
  logged_at: string;
  metadata?: Record<string, unknown>;
}

export interface DailyActivity {
  date: string;
  steps: number;
  active_minutes: number;
  calories_burned: number;
  distance_km: number;
  exercises: ExerciseLog[];
}

// ============================================
// HABIT TRACKING TYPES
// ============================================

export type HabitType =
  | 'weight'
  | 'hydration'
  | 'sleep_duration'
  | 'sleep_quality'
  | 'mood'
  | 'bowels'
  | 'period_cycle'
  | 'five_a_day'
  | 'steps'
  | 'medication_taken'
  | 'supplement_taken'
  | 'alcohol'
  | 'smoking'
  | 'custom';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type BristolStoolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type PeriodFlowLevel = 'spotting' | 'light' | 'medium' | 'heavy';

export interface HabitLog {
  id: string;
  user_id: string;
  habit_type: HabitType;
  value: number | string;
  unit?: string;
  notes?: string;
  logged_at: string;
}

// Specific habit log types for type safety
export interface WeightHabitLog extends HabitLog {
  habit_type: 'weight';
  value: number; // kg
}

export interface HydrationHabitLog extends HabitLog {
  habit_type: 'hydration';
  value: number; // ml
}

export interface SleepHabitLog extends HabitLog {
  habit_type: 'sleep_duration';
  value: number; // hours
  quality?: SleepQuality;
}

export interface MoodHabitLog extends HabitLog {
  habit_type: 'mood';
  value: MoodLevel;
}

export interface BowelHabitLog extends HabitLog {
  habit_type: 'bowels';
  value: BristolStoolType;
}

export interface PeriodHabitLog extends HabitLog {
  habit_type: 'period_cycle';
  value: PeriodFlowLevel;
  symptoms?: string[];
}

export interface FiveADayHabitLog extends HabitLog {
  habit_type: 'five_a_day';
  value: number; // servings 0-5+
}

// ============================================
// WEIGHT TRACKING TYPES
// ============================================

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  notes?: string;
  logged_at: string;
}
