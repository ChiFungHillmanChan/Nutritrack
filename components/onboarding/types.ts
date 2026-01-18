/**
 * Type definitions for the Onboarding flow
 */

import type { Ionicons } from '@expo/vector-icons';
import type {
  UserGoal,
  HealthGoal,
  MedicalCondition,
  Gender,
  ActivityLevel,
  DietaryPreference,
  Medication,
  Supplement,
  DailyTargets,
} from '../../types';

// Re-export domain types for convenience
export type {
  UserGoal,
  HealthGoal,
  MedicalCondition,
  Gender,
  ActivityLevel,
  DietaryPreference,
  Medication,
  Supplement,
  DailyTargets,
};

// ===== STEP TYPES =====

export type Step = 'basics' | 'metrics' | 'goals' | 'conditions' | 'medications' | 'dietary' | 'summary';

export const STEPS: Step[] = ['basics', 'metrics', 'goals', 'conditions', 'medications', 'dietary', 'summary'];

// ===== CALCULATION TYPES =====

export interface TargetCalculationParams {
  height: number;
  weight: number;
  age?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  goal: UserGoal;
  healthGoals?: HealthGoal[];
  conditions: MedicalCondition[];
}

export type CalculateDailyTargetsFunction = (params: TargetCalculationParams) => DailyTargets;

// ===== OPTION TYPES =====

export interface GenderOption {
  value: Gender;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface ActivityLevelOption {
  value: ActivityLevel;
  label: string;
  desc: string;
}

export interface PrimaryGoalOption {
  value: UserGoal;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  desc: string;
  color: string;
}

export interface HealthGoalOption {
  value: HealthGoal;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface ConditionOption {
  value: MedicalCondition;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface DietaryPrefOption {
  value: DietaryPreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// ===== TRANSLATION FUNCTION TYPE =====

export type TranslationFunction = (key: string) => string;

// ===== ONBOARDING STATE TYPE =====

export interface OnboardingState {
  // Basic info
  name: string;
  gender: Gender | null;
  dateOfBirth: Date;
  showDatePicker: boolean;

  // Metrics
  height: string;
  weight: string;
  activityLevel: ActivityLevel;

  // Goals
  primaryGoal: UserGoal | null;
  healthGoals: HealthGoal[];

  // Medical
  conditions: MedicalCondition[];

  // Medications & Supplements
  medications: Medication[];
  supplements: Supplement[];
  newMedName: string;
  newSuppName: string;

  // Dietary
  dietaryPrefs: DietaryPreference[];
  allergies: string[];
  newAllergy: string;

  // Loading state
  isLoading: boolean;
}

export interface OnboardingActions {
  // Basic setters
  setName: (name: string) => void;
  setGender: (gender: Gender) => void;
  setDateOfBirth: (date: Date) => void;
  setShowDatePicker: (show: boolean) => void;

  // Metrics setters
  setHeight: (height: string) => void;
  setWeight: (weight: string) => void;
  setActivityLevel: (level: ActivityLevel) => void;

  // Goals setters
  setPrimaryGoal: (goal: UserGoal) => void;
  handleHealthGoalToggle: (goal: HealthGoal) => void;

  // Medical setters
  handleConditionToggle: (condition: MedicalCondition) => void;

  // Medications & Supplements
  setNewMedName: (name: string) => void;
  setNewSuppName: (name: string) => void;
  addMedication: () => void;
  removeMedication: (id: string) => void;
  addSupplement: () => void;
  removeSupplement: (id: string) => void;

  // Dietary
  handleDietaryPrefToggle: (pref: DietaryPreference) => void;
  setNewAllergy: (allergy: string) => void;
  addAllergy: () => void;
  removeAllergy: (allergy: string) => void;

  // Loading
  setIsLoading: (loading: boolean) => void;
}
