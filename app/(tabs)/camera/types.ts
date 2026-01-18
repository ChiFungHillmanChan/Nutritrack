/**
 * Types and configuration for camera screen components
 */

import { Ionicons } from '@expo/vector-icons';
import { MealType, NutritionData } from '../../../types';
import { COLORS } from '../../../constants/colors';

/**
 * Configuration for meal type selection buttons
 */
export interface MealTypeConfig {
  type: MealType;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

/**
 * Meal type options for selection
 */
export const MEAL_TYPES: MealTypeConfig[] = [
  { type: 'breakfast', labelKey: 'mealTypes.breakfast', icon: 'sunny', color: COLORS.calories },
  { type: 'lunch', labelKey: 'mealTypes.lunch', icon: 'partly-sunny', color: COLORS.carbs },
  { type: 'dinner', labelKey: 'mealTypes.dinner', icon: 'moon', color: COLORS.protein },
  { type: 'snack', labelKey: 'mealTypes.snack', icon: 'cafe', color: COLORS.fat },
];

/**
 * Analysis result data structure
 */
export interface AnalysisResultData {
  food_name: string;
  portion_size_grams: number;
  nutrition: NutritionData;
  confidence: number;
}
