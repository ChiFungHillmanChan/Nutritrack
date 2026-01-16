/**
 * Settings Repository - App settings persistence
 *
 * Manages app-level settings stored in SQLite.
 */

import { getDatabase, parseJSON, stringifyJSON } from '../database';

// App settings structure
export interface AppSettings {
  notifications_enabled: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
  haptics_enabled: boolean;
  analytics_enabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications_enabled: true,
  language: 'zh-TW',
  theme: 'light',
  haptics_enabled: true,
  analytics_enabled: true,
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
  };
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
