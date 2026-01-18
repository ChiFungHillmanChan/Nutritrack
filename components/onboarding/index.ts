/**
 * Onboarding components barrel export
 */

// Steps
export * from './steps';

// Hooks
export { useOnboardingState } from './hooks/useOnboardingState';
export type { OnboardingInitialValues } from './hooks/useOnboardingState';

// Options (translation helpers)
export {
  getGenderOptions,
  getActivityLevels,
  getPrimaryGoals,
  getHealthGoals,
  getConditions,
  getDietaryPrefs,
} from './options';

// Styles
export { styles } from './styles';

// Types
export type {
  Step,
  TranslationFunction,
  OnboardingState,
  OnboardingActions,
  GenderOption,
  ActivityLevelOption,
  PrimaryGoalOption,
  HealthGoalOption,
  ConditionOption,
  DietaryPrefOption,
  CalculateDailyTargetsFunction,
  TargetCalculationParams,
} from './types';

export { STEPS } from './types';
