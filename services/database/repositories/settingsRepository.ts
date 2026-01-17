/**
 * Settings Repository - App settings persistence
 *
 * Manages app-level settings stored in SQLite.
 */

import { getDatabase, parseJSON, stringifyJSON } from '../database';
import type {
  Gender,
  ActivityLevel,
  UserGoal,
  HealthGoal,
  MedicalCondition,
  DietaryPreference,
  Medication,
  Supplement,
} from '../../../types';

// App settings structure
export interface AppSettings {
  notifications_enabled: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
  haptics_enabled: boolean;
  analytics_enabled: boolean;
  is_logged_in: boolean;
  current_user_id: string | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications_enabled: true,
  language: 'zh-TW',
  theme: 'light',
  haptics_enabled: true,
  analytics_enabled: true,
  is_logged_in: false,
  current_user_id: null,
};

/**
 * Get a setting value by key
 */
export function getSetting<T>(key: string, defaultValue: T): T {
  const db = getDatabase();
  const row = db.getFirstSync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key]
  );
  
  if (!row) return defaultValue;
  
  return parseJSON<T>(row.value, defaultValue);
}

/**
 * Set a setting value
 */
export function setSetting<T>(key: string, value: T): void {
  const db = getDatabase();
  const jsonValue = stringifyJSON(value);
  const timestamp = new Date().toISOString();
  
  db.runSync(
    `INSERT INTO app_settings (key, value, updated_at) 
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
    [key, jsonValue, timestamp, jsonValue, timestamp]
  );
}

/**
 * Get all app settings
 */
export function getAllSettings(): AppSettings {
  return {
    notifications_enabled: getSetting('notifications_enabled', DEFAULT_SETTINGS.notifications_enabled),
    language: getSetting('language', DEFAULT_SETTINGS.language),
    theme: getSetting('theme', DEFAULT_SETTINGS.theme),
    haptics_enabled: getSetting('haptics_enabled', DEFAULT_SETTINGS.haptics_enabled),
    analytics_enabled: getSetting('analytics_enabled', DEFAULT_SETTINGS.analytics_enabled),
    is_logged_in: getSetting('is_logged_in', DEFAULT_SETTINGS.is_logged_in),
    current_user_id: getSetting('current_user_id', DEFAULT_SETTINGS.current_user_id),
  };
}

/**
 * Set login state
 */
export function setLoginState(isLoggedIn: boolean, userId: string | null): void {
  setSetting('is_logged_in', isLoggedIn);
  setSetting('current_user_id', userId);
}

/**
 * Check if user is logged in
 */
export function isUserLoggedIn(): boolean {
  return getSetting('is_logged_in', false);
}

/**
 * Get current logged in user ID
 */
export function getCurrentUserId(): string | null {
  return getSetting('current_user_id', null);
}

/**
 * Update multiple settings at once
 */
export function updateSettings(settings: Partial<AppSettings>): AppSettings {
  Object.entries(settings).forEach(([key, value]) => {
    if (value !== undefined) {
      setSetting(key, value);
    }
  });
  
  return getAllSettings();
}

/**
 * Reset all settings to defaults
 */
export function resetSettings(): AppSettings {
  Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => {
    setSetting(key, value);
  });
  
  return DEFAULT_SETTINGS;
}

/**
 * Clear all user data (for account deletion/reset)
 */
export function clearAllUserData(userId: string): boolean {
  const db = getDatabase();
  
  try {
    // Delete all user-related data
    db.runSync('DELETE FROM food_logs WHERE user_id = ?', [userId]);
    db.runSync('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
    db.runSync('DELETE FROM habit_logs WHERE user_id = ?', [userId]);
    db.runSync('DELETE FROM exercise_logs WHERE user_id = ?', [userId]);
    
    return true;
  } catch (error) {
    console.error('[SettingsRepository] Clear user data error:', error);
    return false;
  }
}

/**
 * Get database statistics for display
 */
export function getDatabaseStats(userId: string): {
  foodLogsCount: number;
  chatMessagesCount: number;
  habitLogsCount: number;
  exerciseLogsCount: number;
} {
  const db = getDatabase();
  
  const foodLogs = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM food_logs WHERE user_id = ?',
    [userId]
  );
  const chatMessages = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ?',
    [userId]
  );
  const habitLogs = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habit_logs WHERE user_id = ?',
    [userId]
  );
  const exerciseLogs = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercise_logs WHERE user_id = ?',
    [userId]
  );
  
  return {
    foodLogsCount: foodLogs?.count ?? 0,
    chatMessagesCount: chatMessages?.count ?? 0,
    habitLogsCount: habitLogs?.count ?? 0,
    exerciseLogsCount: exerciseLogs?.count ?? 0,
  };
}

// ============================================
// ONBOARDING PROGRESS PERSISTENCE
// ============================================

/**
 * Onboarding progress data structure
 * Stores all form data from the 7-step onboarding process
 */
export interface OnboardingProgress {
  // Current step (0-indexed position in STEPS array)
  currentStep: number;
  // User ID (Supabase auth ID) to associate progress with
  userId: string;
  // Timestamp when progress was last saved
  lastUpdated: string;
  
  // Step 1: Basics
  name?: string;
  gender?: Gender | null;
  dateOfBirth?: string; // ISO date string
  
  // Step 2: Metrics
  height?: string;
  weight?: string;
  activityLevel?: ActivityLevel;
  
  // Step 3: Goals
  primaryGoal?: UserGoal | null;
  healthGoals?: HealthGoal[];
  
  // Step 4: Conditions
  conditions?: MedicalCondition[];
  
  // Step 5: Medications
  medications?: Medication[];
  supplements?: Supplement[];
  
  // Step 6: Dietary
  dietaryPrefs?: DietaryPreference[];
  allergies?: string[];
}

const ONBOARDING_PROGRESS_KEY = 'onboarding_progress';

/**
 * Save onboarding progress for a user
 * This is called after each step to persist the user's input
 */
export function saveOnboardingProgress(progress: OnboardingProgress): void {
  setSetting(`${ONBOARDING_PROGRESS_KEY}_${progress.userId}`, {
    ...progress,
    lastUpdated: new Date().toISOString(),
  });
}

/**
 * Get onboarding progress for a user
 * Returns null if no progress exists
 */
export function getOnboardingProgress(userId: string): OnboardingProgress | null {
  const progress = getSetting<OnboardingProgress | null>(
    `${ONBOARDING_PROGRESS_KEY}_${userId}`,
    null
  );
  return progress;
}

/**
 * Clear onboarding progress for a user
 * Called when onboarding is completed or user wants to start fresh
 */
export function clearOnboardingProgress(userId: string): void {
  const db = getDatabase();
  const key = `${ONBOARDING_PROGRESS_KEY}_${userId}`;
  db.runSync('DELETE FROM app_settings WHERE key = ?', [key]);
}

/**
 * Check if user has saved onboarding progress
 */
export function hasOnboardingProgress(userId: string): boolean {
  const progress = getOnboardingProgress(userId);
  return progress !== null;
}
