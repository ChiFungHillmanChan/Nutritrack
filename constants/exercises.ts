/**
 * Exercise Constants
 * 
 * Defines exercise types, MET values, and display information.
 */

import { Ionicons } from '@expo/vector-icons';
import { ExerciseType } from '../types';
import { COLORS } from './colors';

// Exercise type display information
export interface ExerciseTypeInfo {
  value: ExerciseType;
  label: string;
  labelZh: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  met: number; // Metabolic Equivalent of Task
  category: ExerciseCategory;
}

export type ExerciseCategory = 
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'sports'
  | 'outdoor'
  | 'other';

export const EXERCISE_CATEGORIES: Record<ExerciseCategory, { label: string; labelZh: string }> = {
  cardio: { label: 'Cardio', labelZh: '有氧運動' },
  strength: { label: 'Strength', labelZh: '力量訓練' },
  flexibility: { label: 'Flexibility', labelZh: '柔韌性' },
  sports: { label: 'Sports', labelZh: '球類運動' },
  outdoor: { label: 'Outdoor', labelZh: '戶外活動' },
  other: { label: 'Other', labelZh: '其他' },
};

export const EXERCISE_TYPES: ExerciseTypeInfo[] = [
  // Cardio
  {
    value: 'walking',
    label: 'Walking',
    labelZh: '步行',
    icon: 'walk',
    color: COLORS.carbs,
    met: 3.5,
    category: 'cardio',
  },
  {
    value: 'running',
    label: 'Running',
    labelZh: '跑步',
    icon: 'fitness',
    color: COLORS.calories,
    met: 9.8,
    category: 'cardio',
  },
  {
    value: 'cycling',
    label: 'Cycling',
    labelZh: '騎單車',
    icon: 'bicycle',
    color: COLORS.primary,
    met: 7.5,
    category: 'cardio',
  },
  {
    value: 'swimming',
    label: 'Swimming',
    labelZh: '游泳',
    icon: 'water',
    color: COLORS.sodium,
    met: 8.0,
    category: 'cardio',
  },
  {
    value: 'hiit',
    label: 'HIIT',
    labelZh: '高強度間歇訓練',
    icon: 'flash',
    color: COLORS.error,
    met: 10.0,
    category: 'cardio',
  },
  {
    value: 'elliptical',
    label: 'Elliptical',
    labelZh: '橢圓機',
    icon: 'fitness-outline',
    color: COLORS.protein,
    met: 5.0,
    category: 'cardio',
  },
  {
    value: 'rowing',
    label: 'Rowing',
    labelZh: '划船機',
    icon: 'boat',
    color: COLORS.fat,
    met: 7.0,
    category: 'cardio',
  },
  {
    value: 'stair_climbing',
    label: 'Stair Climbing',
    labelZh: '爬樓梯',
    icon: 'arrow-up',
    color: COLORS.calories,
    met: 8.0,
    category: 'cardio',
  },

  // Strength
  {
    value: 'strength_training',
    label: 'Strength Training',
    labelZh: '力量訓練',
    icon: 'barbell',
    color: COLORS.protein,
    met: 6.0,
    category: 'strength',
  },

  // Flexibility
  {
    value: 'yoga',
    label: 'Yoga',
    labelZh: '瑜伽',
    icon: 'body',
    color: COLORS.fiber,
    met: 3.0,
    category: 'flexibility',
  },
  {
    value: 'pilates',
    label: 'Pilates',
    labelZh: '普拉提',
    icon: 'body-outline',
    color: COLORS.carbs,
    met: 3.5,
    category: 'flexibility',
  },
  {
    value: 'stretching',
    label: 'Stretching',
    labelZh: '拉伸',
    icon: 'expand',
    color: COLORS.fiber,
    met: 2.5,
    category: 'flexibility',
  },

  // Sports
  {
    value: 'dancing',
    label: 'Dancing',
    labelZh: '跳舞',
    icon: 'musical-notes',
    color: COLORS.carbs,
    met: 5.5,
    category: 'sports',
  },
  {
    value: 'team_sports',
    label: 'Team Sports',
    labelZh: '團體運動',
    icon: 'people',
    color: COLORS.primary,
    met: 7.0,
    category: 'sports',
  },
  {
    value: 'martial_arts',
    label: 'Martial Arts',
    labelZh: '武術',
    icon: 'hand-left',
    color: COLORS.error,
    met: 7.5,
    category: 'sports',
  },

  // Outdoor
  {
    value: 'hiking',
    label: 'Hiking',
    labelZh: '行山',
    icon: 'trail-sign',
    color: COLORS.fiber,
    met: 6.0,
    category: 'outdoor',
  },
  {
    value: 'climbing',
    label: 'Climbing',
    labelZh: '攀岩',
    icon: 'trending-up',
    color: COLORS.calories,
    met: 8.0,
    category: 'outdoor',
  },

  // Other
  {
    value: 'other',
    label: 'Other',
    labelZh: '其他',
    icon: 'ellipsis-horizontal',
    color: COLORS.textSecondary,
    met: 4.0,
    category: 'other',
  },
];

/**
 * Get exercise type info by value
 */
export function getExerciseTypeInfo(type: ExerciseType): ExerciseTypeInfo | undefined {
  return EXERCISE_TYPES.find((ex) => ex.value === type);
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: ExerciseCategory): ExerciseTypeInfo[] {
  return EXERCISE_TYPES.filter((ex) => ex.category === category);
}

/**
 * Calculate calories burned
 * Formula: Calories = MET × weight (kg) × duration (hours)
 */
export function calculateExerciseCalories(
  exerciseType: ExerciseType,
  durationMinutes: number,
  weightKg: number
): number {
  const exercise = getExerciseTypeInfo(exerciseType);
  const met = exercise?.met || 4.0;
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分鐘`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} 小時`;
  }
  return `${hours} 小時 ${mins} 分鐘`;
}

/**
 * Format calories for display
 */
export function formatCaloriesBurned(calories: number): string {
  return `${calories} kcal`;
}
