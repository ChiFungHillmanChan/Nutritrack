/**
 * Core TypeScript types for Nutritrack
 *
 * This file re-exports all types from domain-specific modules
 */

// User profile types
export type {
  Gender,
  ActivityLevel,
  HealthGoal,
  UserGoal,
  MedicalCondition,
  DietaryPreference,
  Medication,
  Supplement,
  User,
  DailyTargets,
} from './user';

// Food and nutrition types
export type {
  MealType,
  NutritionData,
  FoodLog,
  FoodAnalysisRequest,
  FoodAnalysisResponse,
  ClarificationQuestion,
  NutritionFact,
  NutritionCategory,
  PortionGuide,
} from './nutrition';

// Exercise and habit tracking types
export type {
  ExerciseType,
  ExerciseSource,
  ExerciseLog,
  DailyActivity,
  HabitType,
  MoodLevel,
  BristolStoolType,
  SleepQuality,
  PeriodFlowLevel,
  HabitLog,
  WeightHabitLog,
  HydrationHabitLog,
  SleepHabitLog,
  MoodHabitLog,
  BowelHabitLog,
  PeriodHabitLog,
  FiveADayHabitLog,
  WeightLog,
} from './activity';

// Wellness types
export type {
  AmbientSoundType,
  BreathingExerciseType,
  MeditationType,
  MeditationSession,
  AffirmationCategory,
  Affirmation,
} from './wellness';

// Calculator types
export type {
  InsulinCalculation,
  CreonCalculation,
} from './calculator';

// Notification types
export type {
  NotificationSettings,
  MedicationReminder,
  SupplementReminder,
  HabitReminder,
} from './notification';

// Summary types
export type {
  ApiResponse,
  DailySummary,
  WeeklySummary,
  EnergyBalance,
} from './summary';
