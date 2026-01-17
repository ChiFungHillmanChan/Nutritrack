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

export const EXERCISE_CATEGORY_INFO: Record<ExerciseCategory, { label: string; labelZh: string }> = {
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

/**
 * Get localized exercise label based on language
 */
export function getLocalizedExerciseLabel(exercise: ExerciseTypeInfo, language: 'en' | 'zh-TW'): string {
  return language === 'en' ? exercise.label : exercise.labelZh;
}

/**
 * Get localized category label based on language
 */
export function getLocalizedCategoryLabel(category: ExerciseCategory, language: 'en' | 'zh-TW'): string {
  const categoryInfo = EXERCISE_CATEGORY_INFO[category];
  return language === 'en' ? categoryInfo.label : categoryInfo.labelZh;
}

// ============================================
// EXERCISE GUIDE DATA (for Exercise Guide tool)
// ============================================

export interface Exercise {
  id: string;
  name: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  steps: string[];
  icon: keyof typeof Ionicons.glyphMap;
}

export interface ExerciseGuideCategory {
  id: string;
  color: string;
  exercises: Exercise[];
}

/**
 * Exercise categories with detailed exercises for the Exercise Guide tool
 * Note: Category names and descriptions are stored in locales for i18n
 */
export const EXERCISE_GUIDE_CATEGORIES: ExerciseGuideCategory[] = [
  {
    id: 'stretching',
    color: COLORS.fiber,
    exercises: [
      {
        id: 'neck-stretch',
        name: '頸部伸展',
        duration: '2 分鐘',
        difficulty: 'easy',
        description: '放鬆頸部肌肉，減少緊張感',
        steps: [
          '坐直或站立，放鬆肩膀',
          '慢慢將頭向右傾斜，耳朵靠近肩膀',
          '保持 15-30 秒',
          '回到中間位置，換左邊重複',
          '前後傾斜頭部各 15 秒',
        ],
        icon: 'body',
      },
      {
        id: 'shoulder-roll',
        name: '肩膀滾動',
        duration: '1 分鐘',
        difficulty: 'easy',
        description: '釋放肩膀壓力',
        steps: [
          '站立或坐直',
          '聳起肩膀至耳朵',
          '向後滾動肩膀',
          '重複 10 次',
          '換方向向前滾動 10 次',
        ],
        icon: 'fitness',
      },
    ],
  },
  {
    id: 'cardio',
    color: COLORS.calories,
    exercises: [
      {
        id: 'walking',
        name: '室內步行',
        duration: '10 分鐘',
        difficulty: 'easy',
        description: '不出門也能運動',
        steps: [
          '在室內來回步行',
          '保持中等步速',
          '擺動手臂增加運動量',
          '可以在廣告時間進行',
          '目標每日累計 30 分鐘',
        ],
        icon: 'walk',
      },
      {
        id: 'marching',
        name: '原地踏步',
        duration: '5 分鐘',
        difficulty: 'easy',
        description: '簡單有效的熱身運動',
        steps: [
          '站立，雙腳與肩同寬',
          '交替抬起膝蓋',
          '膝蓋盡量抬至腰部高度',
          '同時擺動手臂',
          '保持穩定呼吸',
        ],
        icon: 'footsteps',
      },
    ],
  },
  {
    id: 'strength',
    color: COLORS.protein,
    exercises: [
      {
        id: 'wall-pushup',
        name: '牆壁俯臥撐',
        duration: '3 分鐘',
        difficulty: 'easy',
        description: '適合初學者的上身訓練',
        steps: [
          '面對牆壁站立，距離約一臂長',
          '雙手放在牆上，與肩同寬',
          '彎曲手肘，身體向牆壁靠近',
          '推回起始位置',
          '重複 10-15 次',
        ],
        icon: 'body',
      },
      {
        id: 'chair-squat',
        name: '椅子深蹲',
        duration: '3 分鐘',
        difficulty: 'medium',
        description: '強化下肢肌肉',
        steps: [
          '站在椅子前面',
          '雙腳與肩同寬',
          '慢慢坐下，臀部輕觸椅子',
          '立即站起來',
          '重複 10-15 次',
        ],
        icon: 'accessibility',
      },
    ],
  },
];
