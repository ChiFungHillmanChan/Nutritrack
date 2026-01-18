/**
 * Health Integration Service
 * 
 * Provides integration with Apple Health (iOS) and Google Fit (Android).
 * Uses conditional imports based on platform.
 * 
 * CURRENT STATUS: Health integration is disabled for initial release.
 * Users should manually input their health data (weight, exercise, etc.).
 * This module preserves the type definitions and structure for future implementation.
 * 
 * FUTURE IMPLEMENTATION REQUIREMENTS:
 * - iOS: react-native-health + HealthKit entitlements
 * - Android: react-native-google-fit + OAuth setup
 * 
 * When ready to implement, set HEALTH_INTEGRATION_ENABLED = true and follow
 * the SETUP_INSTRUCTIONS at the bottom of this file.
 */

import { Platform } from 'react-native';
import { createLogger } from '../lib/logger';

const logger = createLogger('[HealthIntegration]');

/**
 * Feature flag for health integration.
 * Set to true when health integration packages are installed and configured.
 */
export const HEALTH_INTEGRATION_ENABLED = false;
import { ExerciseLog, ExerciseType } from '../types';

// Health data types we want to access
export type HealthDataType = 
  | 'steps'
  | 'active_energy'
  | 'workouts'
  | 'heart_rate'
  | 'distance'
  | 'sleep';

export interface HealthPermission {
  type: HealthDataType;
  read: boolean;
  write: boolean;
}

export interface StepsData {
  date: string;
  steps: number;
}

export interface ActiveEnergyData {
  date: string;
  calories: number;
}

export interface WorkoutData {
  id: string;
  type: ExerciseType;
  startDate: string;
  endDate: string;
  duration: number; // minutes
  calories: number;
  distance?: number; // km
  source: 'apple_health' | 'google_fit';
}

export interface HealthSyncResult {
  success: boolean;
  steps?: number;
  activeCalories?: number;
  workouts?: WorkoutData[];
  error?: string;
}

/**
 * Check if health integration is available on this device.
 * Returns false when HEALTH_INTEGRATION_ENABLED is false (current state).
 */
export function isHealthAvailable(): boolean {
  // Health integration is disabled for initial release
  if (!HEALTH_INTEGRATION_ENABLED) {
    return false;
  }
  
  // Health integration requires native modules which may not be available in Expo Go
  // In a production app with a development build, this would check for the actual module
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Get the name of the health app for the current platform
 */
export function getHealthAppName(): string {
  if (Platform.OS === 'ios') {
    return 'Apple Health';
  }
  if (Platform.OS === 'android') {
    return 'Google Fit';
  }
  return 'Health App';
}

/**
 * Request permissions to access health data
 * 
 * NOTE: This is a placeholder. Actual implementation requires:
 * - iOS: react-native-health with proper entitlements
 * - Android: react-native-google-fit with OAuth setup
 */
export async function requestHealthPermissions(
  _permissions: HealthPermission[]
): Promise<{ granted: boolean; error?: string }> {
  if (!isHealthAvailable()) {
    return { granted: false, error: 'Health integration not available on this platform' };
  }

  // In a production app, this would call the native health APIs
  // For now, we simulate the permission flow
  
  if (Platform.OS === 'ios') {
    // iOS: Would use react-native-health
    // AppleHealthKit.initHealthKit(permissions, callback)
    logger.warn('Apple Health integration requires react-native-health package');
    return { granted: false, error: 'Apple Health not configured' };
  }

  if (Platform.OS === 'android') {
    // Android: Would use react-native-google-fit
    // GoogleFit.checkIsAuthorized()
    logger.warn('Google Fit integration requires react-native-google-fit package');
    return { granted: false, error: 'Google Fit not configured' };
  }

  return { granted: false, error: 'Unsupported platform' };
}

/**
 * Check if we have permission to access health data
 */
export async function checkHealthPermissions(): Promise<boolean> {
  if (!isHealthAvailable()) {
    return false;
  }

  // This would check actual permissions in a production app
  return false;
}

/**
 * Fetch today's step count from health app
 */
export async function fetchTodaySteps(): Promise<{ steps: number; error?: string }> {
  if (!isHealthAvailable()) {
    return { steps: 0, error: 'Health integration not available' };
  }

  // Placeholder - would call native health API
  // Return demo data for testing
  return { steps: 0, error: 'Health API not configured' };
}

/**
 * Fetch step count for a date range
 */
export async function fetchStepsForRange(
  _startDate: Date,
  _endDate: Date
): Promise<StepsData[]> {
  if (!isHealthAvailable()) {
    return [];
  }

  // Placeholder - would call native health API
  return [];
}

/**
 * Fetch active calories burned today
 */
export async function fetchTodayActiveCalories(): Promise<ActiveEnergyData | null> {
  if (!isHealthAvailable()) {
    return null;
  }

  // Placeholder - would call native health API
  return null;
}

/**
 * Fetch workouts for a date range
 */
export async function fetchWorkouts(
  _startDate: Date,
  _endDate: Date
): Promise<WorkoutData[]> {
  if (!isHealthAvailable()) {
    return [];
  }

  // Placeholder - would call native health API
  return [];
}

/**
 * Sync all health data for today
 */
export async function syncTodayHealthData(): Promise<HealthSyncResult> {
  if (!isHealthAvailable()) {
    return { success: false, error: 'Health integration not available' };
  }

  const hasPermission = await checkHealthPermissions();
  if (!hasPermission) {
    return { success: false, error: 'Health permissions not granted' };
  }

  // Fetch all data
  const [stepsResult, caloriesResult, workouts] = await Promise.all([
    fetchTodaySteps(),
    fetchTodayActiveCalories(),
    fetchWorkouts(
      new Date(new Date().setHours(0, 0, 0, 0)),
      new Date()
    ),
  ]);

  return {
    success: true,
    steps: stepsResult.steps,
    activeCalories: caloriesResult?.calories ?? 0,
    workouts,
  };
}

/**
 * Convert health app workout type to our ExerciseType
 */
export function mapHealthWorkoutType(healthType: string): ExerciseType {
  const typeMap: Record<string, ExerciseType> = {
    // Apple Health workout types
    HKWorkoutActivityTypeWalking: 'walking',
    HKWorkoutActivityTypeRunning: 'running',
    HKWorkoutActivityTypeCycling: 'cycling',
    HKWorkoutActivityTypeSwimming: 'swimming',
    HKWorkoutActivityTypeYoga: 'yoga',
    HKWorkoutActivityTypeStrengthTraining: 'strength_training',
    HKWorkoutActivityTypeHIIT: 'hiit',
    HKWorkoutActivityTypePilates: 'pilates',
    HKWorkoutActivityTypeDance: 'dancing',
    HKWorkoutActivityTypeHiking: 'hiking',
    HKWorkoutActivityTypeStairClimbing: 'stair_climbing',
    HKWorkoutActivityTypeElliptical: 'elliptical',
    HKWorkoutActivityTypeRowing: 'rowing',
    HKWorkoutActivityTypeMartialArts: 'martial_arts',
    HKWorkoutActivityTypeClimbing: 'climbing',
    HKWorkoutActivityTypeSoccer: 'team_sports',
    HKWorkoutActivityTypeBasketball: 'team_sports',
    HKWorkoutActivityTypeTennis: 'team_sports',

    // Google Fit activity types (numeric codes converted to strings)
    walking: 'walking',
    running: 'running',
    biking: 'cycling',
    swimming: 'swimming',
    yoga: 'yoga',
    strength_training: 'strength_training',
    hiit: 'hiit',
    pilates: 'pilates',
    dancing: 'dancing',
    hiking: 'hiking',
    stair_climbing: 'stair_climbing',
    elliptical: 'elliptical',
    rowing: 'rowing',
    martial_arts: 'martial_arts',
    rock_climbing: 'climbing',
  };

  return typeMap[healthType] || 'other';
}

/**
 * Convert health app workout to our ExerciseLog format
 */
export function convertHealthWorkoutToLog(
  workout: WorkoutData,
  userId: string
): Omit<ExerciseLog, 'id'> {
  return {
    user_id: userId,
    exercise_type: workout.type,
    duration_minutes: workout.duration,
    calories_burned: workout.calories,
    distance_km: workout.distance,
    source: workout.source,
    logged_at: workout.startDate,
    metadata: {
      health_workout_id: workout.id,
      end_date: workout.endDate,
    },
  };
}

/**
 * Instructions for setting up health integration
 */
export const SETUP_INSTRUCTIONS = {
  ios: `
To enable Apple Health integration:

1. Install react-native-health:
   npm install react-native-health

2. Add HealthKit capability in Xcode:
   - Open your project in Xcode
   - Go to Signing & Capabilities
   - Add HealthKit capability

3. Add to Info.plist:
   NSHealthShareUsageDescription - "Nutritrack wants to read your health data"
   NSHealthUpdateUsageDescription - "Nutritrack wants to save workout data"

4. Run pod install:
   cd ios && pod install
  `,
  android: `
To enable Google Fit integration:

1. Install react-native-google-fit:
   npm install react-native-google-fit

2. Set up OAuth 2.0 client ID in Google Cloud Console

3. Add to AndroidManifest.xml:
   <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/>

4. Enable Fitness API in Google Cloud Console
  `,
};
