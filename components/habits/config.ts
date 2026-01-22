/**
 * Habit Configuration
 *
 * Centralized configuration for all trackable habits.
 */

import { COLORS } from '../../constants/colors';
import type { HabitConfig } from './index';

/** Default habit configurations for the habits screen */
export const HABIT_CONFIGS: HabitConfig[] = [
  {
    type: 'hydration',
    labelKey: 'habits.types.hydration',
    icon: 'water',
    color: COLORS.sodium,
    unitKey: 'units.ml',
    quickAdd: [250, 500],
    maxValue: 3000,
    explanationKey: 'habits.fluids.explanation',
  },
  {
    type: 'sleep_duration',
    labelKey: 'habits.types.sleep',
    icon: 'moon',
    color: COLORS.protein,
    unitKey: 'units.hours',
    maxValue: 12,
  },
  {
    type: 'mood',
    labelKey: 'habits.types.mood',
    icon: 'happy',
    color: COLORS.carbs,
    maxValue: 5,
  },
  {
    type: 'exercise',
    labelKey: 'habits.types.exercise',
    icon: 'fitness',
    color: COLORS.fiber,
    unitKey: 'units.minutes',
    maxValue: 180,
  },
  {
    type: 'weight',
    labelKey: 'habits.types.weight',
    icon: 'scale',
    color: COLORS.calories,
    unitKey: 'units.kg',
  },
  {
    type: 'bowels',
    labelKey: 'habits.types.bowels',
    icon: 'barbell',
    color: COLORS.fat,
  },
];
