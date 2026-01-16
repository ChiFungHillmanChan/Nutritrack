/**
 * Core TypeScript types for Nutritrack
 */

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

// ============================================
// FOOD LOGGING TYPES
// ============================================

export interface FoodLog {
  id: string;
  user_id: string;
  meal_type: MealType;
  food_name: string;
  portion_size: number;                      // grams
  nutrition_data: NutritionData;
  image_url?: string;
  logged_at: string;
  ai_confidence?: number;                    // 0-1 confidence score
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionData {
  calories: number;
  protein: number;      // grams
  carbs: number;        // grams
  fat: number;          // grams
  fiber: number;        // grams
  sodium: number;       // mg
  sugar?: number;       // grams
  saturated_fat?: number; // grams
  cholesterol?: number; // mg
}

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

// ============================================
// AI ANALYSIS TYPES
// ============================================

export interface FoodAnalysisRequest {
  image_base64: string;
  user_context?: {
    meal_type: MealType;
    dietary_restrictions?: string[];
  };
}

export interface FoodAnalysisResponse {
  success: boolean;
  data?: {
    food_name: string;
    portion_size_grams: number;
    nutrition: NutritionData;
    confidence: number;
    clarification_needed?: ClarificationQuestion;
  };
  error?: string;
}

export interface ClarificationQuestion {
  question: string;
  options: string[];
}

// ============================================
// NUTRITION FACTS & EDUCATION
// ============================================

export interface NutritionFact {
  id: string;
  category: NutritionCategory;
  title: string;
  content: string;
  tags: string[];
  condition_specific?: MedicalCondition[];
}

export type NutritionCategory =
  | 'vitamins'
  | 'minerals'
  | 'macros'
  | 'weight_loss'
  | 'muscle_building'
  | 'diabetes'
  | 'heart_health'
  | 'gut_health'
  | 'mental_health'
  | 'hydration'
  | 'general';

export interface PortionGuide {
  id: string;
  food_name: string;
  category: string;
  serving_size_grams: number;
  visual_reference: string;
  image_url?: string;
  nutrition: NutritionData;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationSettings {
  meal_reminders: {
    breakfast: { enabled: boolean; time: string };
    lunch: { enabled: boolean; time: string };
    dinner: { enabled: boolean; time: string };
  };
  water_reminder: {
    enabled: boolean;
    interval_hours: number;
  };
  weight_reminder: {
    enabled: boolean;
    day_of_week: number;  // 0-6, Sunday = 0
    time: string;
  };
  medication_reminders: MedicationReminder[];
  supplement_reminders: SupplementReminder[];
  habit_reminders: HabitReminder[];
  goal_nudges: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
  };
}

export interface MedicationReminder {
  medication_id: string;
  name: string;
  enabled: boolean;
  time: string; // Single time for simple scheduling
  times?: string[]; // Multiple times for complex schedules
}

export interface SupplementReminder {
  supplement_id: string;
  name: string;
  enabled: boolean;
  time: string;
  times?: string[];
}

export interface HabitReminder {
  habit_type: HabitType;
  name: string;
  enabled: boolean;
  time: string;
}

// ============================================
// WELLNESS TYPES
// ============================================

export type AmbientSoundType =
  | 'rain'
  | 'ocean'
  | 'forest'
  | 'white_noise'
  | 'pink_noise'
  | 'brown_noise'
  | 'fireplace'
  | 'wind'
  | 'birds'
  | 'thunder';

export type BreathingExerciseType =
  | 'box_breathing'
  | 'four_seven_eight'
  | 'deep_breathing'
  | 'alternate_nostril'
  | 'calming_breath';

export type MeditationType = 'breathing' | 'guided' | 'ambient' | 'body_scan' | 'custom';

export interface MeditationSession {
  id: string;
  user_id: string;
  type?: MeditationType;
  duration_minutes: number;
  sound_type?: AmbientSoundType;
  breathing_exercise?: BreathingExerciseType;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

export type AffirmationCategory = 
  | 'health' 
  | 'motivation' 
  | 'gratitude' 
  | 'self_love' 
  | 'strength'
  | 'nutrition'
  | 'mindfulness';

export interface Affirmation {
  id: string;
  category: AffirmationCategory;
  text: string;
  text_zh?: string; // Chinese translation
  author?: string;
}

// ============================================
// CALCULATOR TYPES
// ============================================

export interface InsulinCalculation {
  carbs_grams: number;
  current_blood_sugar?: number;
  target_blood_sugar: number;
  correction_factor: number;
  carb_ratio: number;
  calculated_dose: number;
}

export interface CreonCalculation {
  fat_grams: number;
  lipase_units_per_gram: number;
  calculated_capsules: number;
  capsule_strength: number;
}

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
