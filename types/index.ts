/**
 * Core TypeScript types for Nutritrack
 */

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  height_cm: number;
  weight_kg: number;
  goal: UserGoal;
  medical_conditions: MedicalCondition[];
  daily_targets: DailyTargets;
  created_at: string;
  updated_at: string;
}

export type UserGoal = 'lose_weight' | 'gain_weight' | 'maintain' | 'build_muscle';

export type MedicalCondition = 
  | 'diabetes'
  | 'hypertension'
  | 'heart_disease'
  | 'kidney_disease'
  | 'celiac_disease'
  | 'lactose_intolerance'
  | 'none';

export interface DailyTargets {
  calories: { min: number; max: number };
  protein: { min: number; max: number };    // grams
  carbs: { min: number; max: number };      // grams
  fat: { min: number; max: number };        // grams
  fiber: { min: number; max: number };      // grams
  sodium: { min: number; max: number };     // mg
  water: number;                             // ml
}

// Food logging types
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
}

// Weight tracking types
export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
}

// AI Analysis types
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

// Nutrition facts types
export interface NutritionFact {
  id: string;
  category: NutritionCategory;
  title: string;
  content: string;
  tags: string[];
}

export type NutritionCategory = 
  | 'vitamins'
  | 'minerals'
  | 'macros'
  | 'weight_loss'
  | 'muscle_building'
  | 'general';

// Notification types
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
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Daily summary types
export interface DailySummary {
  date: string;
  consumed: NutritionData;
  targets: DailyTargets;
  meals: FoodLog[];
  water_ml: number;
}
