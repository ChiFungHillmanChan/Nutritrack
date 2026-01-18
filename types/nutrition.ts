/**
 * Food and nutrition types for Nutritrack
 */

import type { MedicalCondition } from './user';

// ============================================
// FOOD LOGGING TYPES
// ============================================

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

export interface ClarificationQuestion {
  question: string;
  options: string[];
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

// ============================================
// NUTRITION FACTS & EDUCATION
// ============================================

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

export interface NutritionFact {
  id: string;
  category: NutritionCategory;
  title: string;
  content: string;
  tags: string[];
  condition_specific?: MedicalCondition[];
}

export interface PortionGuide {
  id: string;
  food_name: string;
  category: string;
  serving_size_grams: number;
  visual_reference: string;
  image_url?: string;
  nutrition: NutritionData;
}
