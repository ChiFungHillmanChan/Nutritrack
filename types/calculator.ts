/**
 * Calculator types for Nutritrack
 */

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
