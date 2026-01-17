/**
 * Energy Calculator Library
 * 
 * Provides functions for calculating BMR, TDEE, and energy balance.
 */

import {
  Gender,
  ActivityLevel,
  EnergyBalance,
  DailyTargets,
  ExerciseLog,
  NutritionData,
} from '../types';

/**
 * MET values for different exercise types
 * MET = Metabolic Equivalent of Task
 */
export const EXERCISE_MET_VALUES: Record<string, number> = {
  walking: 3.5,
  running: 9.8,
  cycling: 7.5,
  swimming: 8.0,
  strength_training: 6.0,
  yoga: 3.0,
  hiit: 10.0,
  pilates: 3.5,
  dancing: 5.5,
  hiking: 6.0,
  team_sports: 7.0,
  martial_arts: 7.5,
  climbing: 8.0,
  rowing: 7.0,
  elliptical: 5.0,
  stair_climbing: 8.0,
  stretching: 2.5,
  other: 4.0,
};

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * Most accurate for most individuals
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  // Mifflin-St Jeor Equation
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;

  switch (gender) {
    case 'male':
      return baseBMR + 5;
    case 'female':
      return baseBMR - 161;
    default:
      // Average for other/prefer_not_to_say
      return baseBMR - 78;
  }
}

/**
 * Calculate BMR using Harris-Benedict Equation (alternative)
 */
export function calculateBMRHarrisBenedict(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  switch (gender) {
    case 'male':
      return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
    case 'female':
      return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
    default: {
      // Average
      const male = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
      const female = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
      return (male + female) / 2;
    }
  }
}

/**
 * Get activity multiplier for TDEE calculation
 */
export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  switch (activityLevel) {
    case 'sedentary':
      return 1.2; // Little or no exercise
    case 'light':
      return 1.375; // Light exercise 1-3 days/week
    case 'moderate':
      return 1.55; // Moderate exercise 3-5 days/week
    case 'active':
      return 1.725; // Hard exercise 6-7 days/week
    case 'very_active':
      return 1.9; // Very hard exercise, physical job
    default:
      return 1.55;
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  return bmr * getActivityMultiplier(activityLevel);
}

/**
 * Calculate calories burned from exercise
 */
export function calculateExerciseCalories(
  exercises: ExerciseLog[],
  weightKg: number
): number {
  return exercises.reduce((total, exercise) => {
    const met = EXERCISE_MET_VALUES[exercise.exercise_type] || 4.0;
    // Calories = MET × weight (kg) × duration (hours)
    const hours = exercise.duration_minutes / 60;
    const calories = met * weightKg * hours;
    return total + calories;
  }, 0);
}

/**
 * Calculate calories burned from steps
 * Rough estimate: ~0.04-0.05 calories per step per kg
 */
export function calculateStepCalories(steps: number, weightKg: number): number {
  const caloriesPerStep = 0.04 * (weightKg / 70); // Adjusted for weight
  return steps * caloriesPerStep;
}

/**
 * Calculate complete energy balance for a day
 */
export function calculateEnergyBalance(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  caloriesConsumed: number;
  exercises: ExerciseLog[];
  steps: number;
  dailyTargets: DailyTargets;
}): EnergyBalance {
  const {
    weightKg,
    heightCm,
    age,
    gender,
    activityLevel,
    caloriesConsumed,
    exercises,
    steps,
    dailyTargets,
  } = params;

  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  
  // Calculate additional exercise calories (above sedentary baseline in TDEE)
  const exerciseCalories = calculateExerciseCalories(exercises, weightKg);
  const stepCalories = calculateStepCalories(steps, weightKg);
  
  // Activity burn is exercise + steps beyond what's included in TDEE
  const activityBurn = exerciseCalories + stepCalories;
  
  // Total burn includes TDEE plus additional tracked exercise
  const totalBurn = tdee + activityBurn;
  
  // Net balance: positive means surplus, negative means deficit
  const netBalance = caloriesConsumed - totalBurn;
  
  // Remaining quota based on user's calorie target
  const targetCalories = (dailyTargets.calories.min + dailyTargets.calories.max) / 2;
  const remainingQuota = targetCalories - caloriesConsumed + activityBurn;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    intake: Math.round(caloriesConsumed),
    activity_burn: Math.round(activityBurn),
    total_burn: Math.round(totalBurn),
    net_balance: Math.round(netBalance),
    remaining_quota: Math.round(remainingQuota),
  };
}

/**
 * Calculate macro percentages from nutrition data
 */
export function calculateMacroPercentages(nutrition: NutritionData): {
  protein: number;
  carbs: number;
  fat: number;
} {
  // Calories per gram: protein=4, carbs=4, fat=9
  const proteinCals = nutrition.protein * 4;
  const carbsCals = nutrition.carbs * 4;
  const fatCals = nutrition.fat * 9;
  const totalCals = proteinCals + carbsCals + fatCals;

  if (totalCals === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return {
    protein: Math.round((proteinCals / totalCals) * 100),
    carbs: Math.round((carbsCals / totalCals) * 100),
    fat: Math.round((fatCals / totalCals) * 100),
  };
}

/**
 * Calculate progress towards target
 */
export function calculateProgress(
  current: number,
  target: { min: number; max: number }
): {
  percentage: number;
  status: 'under' | 'optimal' | 'over';
} {
  const midTarget = (target.min + target.max) / 2;
  const percentage = Math.round((current / midTarget) * 100);

  let status: 'under' | 'optimal' | 'over';
  if (current < target.min) {
    status = 'under';
  } else if (current > target.max) {
    status = 'over';
  } else {
    status = 'optimal';
  }

  return { percentage, status };
}

/**
 * Get calorie goal based on user goal
 */
export function getCalorieGoalDescription(
  netBalance: number,
  goal: string
): string {
  switch (goal) {
    case 'lose_weight':
      if (netBalance < -500) return '理想減重範圍';
      if (netBalance < 0) return '輕度熱量赤字';
      return '需要減少攝取或增加運動';
    case 'gain_weight':
    case 'build_muscle':
      if (netBalance > 300) return '理想增重範圍';
      if (netBalance > 0) return '輕度熱量盈餘';
      return '需要增加攝取';
    default:
      if (Math.abs(netBalance) < 200) return '熱量平衡良好';
      if (netBalance > 0) return '略有盈餘';
      return '略有赤字';
  }
}

/**
 * Format calories for display
 */
export function formatCalories(calories: number): string {
  if (Math.abs(calories) >= 1000) {
    return `${(calories / 1000).toFixed(1)}k`;
  }
  return calories.toString();
}

/**
 * Calculate ideal weight range using BMI
 */
export function calculateIdealWeightRange(heightCm: number): {
  min: number;
  max: number;
} {
  const heightM = heightCm / 100;
  // BMI 18.5 - 24.9 is considered healthy
  return {
    min: Math.round(18.5 * heightM * heightM),
    max: Math.round(24.9 * heightM * heightM),
  };
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  value: number;
  category: string;
} {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  let category: string;
  if (bmi < 18.5) category = '過輕';
  else if (bmi < 25) category = '正常';
  else if (bmi < 30) category = '過重';
  else category = '肥胖';

  return {
    value: Math.round(bmi * 10) / 10,
    category,
  };
}
