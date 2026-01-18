/**
 * Translation helper functions for onboarding options
 * These functions return localized option arrays for forms
 */

import { COLORS } from '../../../constants/colors';
import type {
  TranslationFunction,
  GenderOption,
  ActivityLevelOption,
  PrimaryGoalOption,
  HealthGoalOption,
  ConditionOption,
  DietaryPrefOption,
} from './types';

/**
 * Returns gender options with translated labels
 */
export function getGenderOptions(t: TranslationFunction): GenderOption[] {
  return [
    { value: 'male', label: t('onboarding.gender.male'), icon: 'male' },
    { value: 'female', label: t('onboarding.gender.female'), icon: 'female' },
    { value: 'other', label: t('onboarding.gender.other'), icon: 'person' },
    { value: 'prefer_not_to_say', label: t('onboarding.gender.preferNotToSay'), icon: 'help-circle' },
  ];
}

/**
 * Returns activity level options with translated labels and descriptions
 */
export function getActivityLevels(t: TranslationFunction): ActivityLevelOption[] {
  return [
    { value: 'sedentary', label: t('onboarding.activity.sedentary'), desc: t('onboarding.activity.sedentaryDesc') },
    { value: 'light', label: t('onboarding.activity.light'), desc: t('onboarding.activity.lightDesc') },
    { value: 'moderate', label: t('onboarding.activity.moderate'), desc: t('onboarding.activity.moderateDesc') },
    { value: 'active', label: t('onboarding.activity.active'), desc: t('onboarding.activity.activeDesc') },
    { value: 'very_active', label: t('onboarding.activity.veryActive'), desc: t('onboarding.activity.veryActiveDesc') },
  ];
}

/**
 * Returns primary goal options with translated labels, descriptions, and colors
 */
export function getPrimaryGoals(t: TranslationFunction): PrimaryGoalOption[] {
  return [
    { value: 'lose_weight', label: t('onboarding.primaryGoals.loseWeight'), icon: 'trending-down', desc: t('onboarding.primaryGoals.loseWeightDesc'), color: COLORS.calories },
    { value: 'gain_weight', label: t('onboarding.primaryGoals.gainWeight'), icon: 'trending-up', desc: t('onboarding.primaryGoals.gainWeightDesc'), color: COLORS.carbs },
    { value: 'maintain', label: t('onboarding.primaryGoals.maintain'), icon: 'remove', desc: t('onboarding.primaryGoals.maintainDesc'), color: COLORS.fiber },
    { value: 'build_muscle', label: t('onboarding.primaryGoals.buildMuscle'), icon: 'barbell', desc: t('onboarding.primaryGoals.buildMuscleDesc'), color: COLORS.protein },
  ];
}

/**
 * Returns health goal options with translated labels
 */
export function getHealthGoals(t: TranslationFunction): HealthGoalOption[] {
  return [
    { value: 'healthy_balanced_eating', label: t('onboarding.healthGoals.healthyBalancedEating'), icon: 'nutrition' },
    { value: 'weight_loss', label: t('onboarding.healthGoals.weightLoss'), icon: 'trending-down' },
    { value: 'weight_gain', label: t('onboarding.healthGoals.weightGain'), icon: 'trending-up' },
    { value: 'healthy_bowels', label: t('onboarding.healthGoals.healthyBowels'), icon: 'fitness' },
    { value: 'muscle_gain', label: t('onboarding.healthGoals.muscleGain'), icon: 'barbell' },
    { value: 'improve_hydration', label: t('onboarding.healthGoals.improveHydration'), icon: 'water' },
    { value: 'blood_sugar_control', label: t('onboarding.healthGoals.bloodSugarControl'), icon: 'pulse' },
    { value: 'fix_micros', label: t('onboarding.healthGoals.fixMicros'), icon: 'leaf' },
    { value: 'improve_sleep', label: t('onboarding.healthGoals.improveSleep'), icon: 'moon' },
    { value: 'improve_breathing', label: t('onboarding.healthGoals.improveBreathing'), icon: 'cloud' },
    { value: 'reduce_alcohol', label: t('onboarding.healthGoals.reduceAlcohol'), icon: 'beer' },
    { value: 'reduce_smoking', label: t('onboarding.healthGoals.reduceSmoking'), icon: 'ban' },
    { value: 'achieve_10k_steps', label: t('onboarding.healthGoals.achieve10kSteps'), icon: 'footsteps' },
    { value: 'improve_mental_health', label: t('onboarding.healthGoals.improveMentalHealth'), icon: 'happy' },
  ];
}

/**
 * Returns medical condition options with translated labels
 */
export function getConditions(t: TranslationFunction): ConditionOption[] {
  return [
    { value: 'none', label: t('onboarding.conditions.none'), icon: 'checkmark-circle' },
    { value: 't1dm', label: t('onboarding.conditions.t1dm'), icon: 'water' },
    { value: 't2dm', label: t('onboarding.conditions.t2dm'), icon: 'water' },
    { value: 'hypertension', label: t('onboarding.conditions.hypertension'), icon: 'pulse' },
    { value: 'coronary_heart_disease', label: t('onboarding.conditions.coronaryHeartDisease'), icon: 'heart' },
    { value: 'high_cholesterol', label: t('onboarding.conditions.highCholesterol'), icon: 'analytics' },
    { value: 'kidney_disease', label: t('onboarding.conditions.kidneyDisease'), icon: 'medical' },
    { value: 'copd', label: t('onboarding.conditions.copd'), icon: 'cloud' },
    { value: 'asthma', label: t('onboarding.conditions.asthma'), icon: 'cloud-outline' },
    { value: 'cancer', label: t('onboarding.conditions.cancer'), icon: 'ribbon' },
    { value: 'celiac_disease', label: t('onboarding.conditions.celiacDisease'), icon: 'nutrition' },
    { value: 'lactose_intolerance', label: t('onboarding.conditions.lactoseIntolerance'), icon: 'cafe' },
    { value: 'pcos', label: t('onboarding.conditions.pcos'), icon: 'female' },
    { value: 'thyroid_disorders', label: t('onboarding.conditions.thyroidDisorders'), icon: 'body' },
    { value: 'ibs', label: t('onboarding.conditions.ibs'), icon: 'fitness' },
    { value: 'crohns_disease', label: t('onboarding.conditions.crohnsDisease'), icon: 'fitness' },
    { value: 'ulcerative_colitis', label: t('onboarding.conditions.ulcerativeColitis'), icon: 'fitness' },
  ];
}

/**
 * Returns dietary preference options with translated labels
 */
export function getDietaryPrefs(t: TranslationFunction): DietaryPrefOption[] {
  return [
    { value: 'vegetarian', label: t('onboarding.dietaryPrefs.vegetarian'), icon: 'leaf' },
    { value: 'vegan', label: t('onboarding.dietaryPrefs.vegan'), icon: 'flower' },
    { value: 'pescatarian', label: t('onboarding.dietaryPrefs.pescatarian'), icon: 'fish' },
    { value: 'halal', label: t('onboarding.dietaryPrefs.halal'), icon: 'moon' },
    { value: 'kosher', label: t('onboarding.dietaryPrefs.kosher'), icon: 'star' },
    { value: 'gluten_free', label: t('onboarding.dietaryPrefs.glutenFree'), icon: 'nutrition' },
    { value: 'dairy_free', label: t('onboarding.dietaryPrefs.dairyFree'), icon: 'cafe-outline' },
    { value: 'nut_free', label: t('onboarding.dietaryPrefs.nutFree'), icon: 'warning' },
    { value: 'low_sodium', label: t('onboarding.dietaryPrefs.lowSodium'), icon: 'water-outline' },
    { value: 'low_carb', label: t('onboarding.dietaryPrefs.lowCarb'), icon: 'cellular' },
    { value: 'keto', label: t('onboarding.dietaryPrefs.keto'), icon: 'flame' },
  ];
}
