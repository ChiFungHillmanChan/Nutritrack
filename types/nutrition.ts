/**
 * Food and nutrition types for Nutritrack
 */

import type { MedicalCondition } from './user';

// ============================================
// FOOD LOGGING TYPES
// ============================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionData {
  // Core macronutrients (required)
  calories: number;
  protein: number;      // grams
  carbs: number;        // grams
  fat: number;          // grams
  fiber: number;        // grams
  sodium: number;       // mg

  // Extended macronutrients (optional - from AI analysis)
  sugar?: number;       // grams - total sugars
  added_sugar?: number; // grams - added sugars only
  saturated_fat?: number; // grams
  unsaturated_fat?: number; // grams
  trans_fat?: number;   // grams
  cholesterol?: number; // mg

  // Fatty acids (optional)
  omega3?: number;      // grams
  omega6?: number;      // grams

  // Vitamins (optional - AI estimates)
  vitamin_a?: number;   // mcg RAE
  vitamin_b1?: number;  // mg (thiamin)
  vitamin_b2?: number;  // mg (riboflavin)
  vitamin_b3?: number;  // mg (niacin)
  vitamin_b6?: number;  // mg
  vitamin_b12?: number; // mcg
  vitamin_c?: number;   // mg
  vitamin_d?: number;   // mcg
  vitamin_e?: number;   // mg
  vitamin_k?: number;   // mcg

  // Minerals (optional - AI estimates)
  calcium?: number;     // mg
  iron?: number;        // mg
  potassium?: number;   // mg
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
    ingredients: string[];
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
