/**
 * Recommended Nutrient Intake (RNI) Reference Values
 *
 * Based on standard dietary reference intakes for adults.
 * Values are for a 2000 kcal diet.
 */

export interface NutrientRNI {
  id: string;
  labelKey: string;
  unit: string;
  value: number;
  category: 'macros' | 'fats' | 'carbs' | 'micros';
}

export const RNI_VALUES: NutrientRNI[] = [
  // Main Macros
  { id: 'calories', labelKey: 'rni.calories', unit: 'kcal', value: 2000, category: 'macros' },
  { id: 'protein', labelKey: 'rni.protein', unit: 'g', value: 50, category: 'macros' },

  // Fats
  { id: 'saturatedFat', labelKey: 'rni.saturatedFat', unit: 'g', value: 20, category: 'fats' },
  { id: 'unsaturatedFat', labelKey: 'rni.unsaturatedFat', unit: 'g', value: 44, category: 'fats' },
  { id: 'omega3', labelKey: 'rni.omega3', unit: 'g', value: 1.6, category: 'fats' },
  { id: 'omega6', labelKey: 'rni.omega6', unit: 'g', value: 17, category: 'fats' },
  { id: 'transFat', labelKey: 'rni.transFat', unit: 'g', value: 0, category: 'fats' },
  { id: 'cholesterol', labelKey: 'rni.cholesterol', unit: 'mg', value: 300, category: 'fats' },

  // Carbs
  { id: 'totalCarbs', labelKey: 'rni.totalCarbs', unit: 'g', value: 275, category: 'carbs' },
  { id: 'dietaryFiber', labelKey: 'rni.dietaryFiber', unit: 'g', value: 28, category: 'carbs' },
  { id: 'totalSugars', labelKey: 'rni.totalSugars', unit: 'g', value: 50, category: 'carbs' },
  { id: 'addedSugars', labelKey: 'rni.addedSugars', unit: 'g', value: 25, category: 'carbs' },
  { id: 'sodium', labelKey: 'rni.sodium', unit: 'mg', value: 2300, category: 'carbs' },

  // Vitamins
  { id: 'vitaminA', labelKey: 'rni.vitaminA', unit: 'mcg', value: 900, category: 'micros' },
  { id: 'vitaminB1', labelKey: 'rni.vitaminB1', unit: 'mg', value: 1.2, category: 'micros' },
  { id: 'vitaminB2', labelKey: 'rni.vitaminB2', unit: 'mg', value: 1.3, category: 'micros' },
  { id: 'vitaminB3', labelKey: 'rni.vitaminB3', unit: 'mg', value: 16, category: 'micros' },
  { id: 'vitaminB6', labelKey: 'rni.vitaminB6', unit: 'mg', value: 1.7, category: 'micros' },
  { id: 'vitaminB12', labelKey: 'rni.vitaminB12', unit: 'mcg', value: 2.4, category: 'micros' },
  { id: 'vitaminC', labelKey: 'rni.vitaminC', unit: 'mg', value: 90, category: 'micros' },
  { id: 'vitaminD', labelKey: 'rni.vitaminD', unit: 'mcg', value: 20, category: 'micros' },
  { id: 'vitaminE', labelKey: 'rni.vitaminE', unit: 'mg', value: 15, category: 'micros' },
  { id: 'vitaminK', labelKey: 'rni.vitaminK', unit: 'mcg', value: 120, category: 'micros' },

  // Minerals
  { id: 'calcium', labelKey: 'rni.calcium', unit: 'mg', value: 1000, category: 'micros' },
  { id: 'iron', labelKey: 'rni.iron', unit: 'mg', value: 18, category: 'micros' },
  { id: 'potassium', labelKey: 'rni.potassium', unit: 'mg', value: 4700, category: 'micros' },
  { id: 'water', labelKey: 'rni.water', unit: 'ml', value: 2500, category: 'macros' },
];

export const CATEGORIES = {
  macros: { labelKey: 'rni.categoryMacros', order: 0 },
  fats: { labelKey: 'rni.categoryFats', order: 1 },
  carbs: { labelKey: 'rni.categoryCarbs', order: 2 },
  micros: { labelKey: 'rni.categoryMicros', order: 3 },
};
