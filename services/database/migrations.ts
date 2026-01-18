/**
 * Database Migrations
 *
 * Version-based migration system for SQLite schema management.
 * Safe for production app updates.
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import { createLogger } from '../../lib/logger';

const logger = createLogger('[Database]');

export const CURRENT_DB_VERSION = 2;

interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => void;
}

/**
 * All database migrations
 * Add new migrations at the end with incrementing version numbers
 */
const migrations: Migration[] = [
  {
    version: 1,
    up: (db: SQLiteDatabase) => {
      // ============================================
      // USERS TABLE
      // ============================================
      db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY NOT NULL,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          gender TEXT,
          date_of_birth TEXT,
          height_cm REAL NOT NULL DEFAULT 170,
          weight_kg REAL NOT NULL DEFAULT 70,
          activity_level TEXT DEFAULT 'moderate',
          goal TEXT NOT NULL DEFAULT 'maintain',
          health_goals TEXT DEFAULT '[]',
          medical_conditions TEXT DEFAULT '[]',
          medications TEXT DEFAULT '[]',
          supplements TEXT DEFAULT '[]',
          allergies TEXT DEFAULT '[]',
          dietary_preferences TEXT DEFAULT '[]',
          daily_targets TEXT DEFAULT '{}',
          notification_settings TEXT,
          is_demo_user INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // ============================================
      // FOOD LOGS TABLE
      // ============================================
      db.execSync(`
        CREATE TABLE IF NOT EXISTS food_logs (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          meal_type TEXT NOT NULL,
          food_name TEXT NOT NULL,
          portion_size REAL NOT NULL,
          nutrition_data TEXT NOT NULL,
          image_url TEXT,
          logged_at TEXT NOT NULL,
          ai_confidence REAL,
          synced_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Index for faster date queries
      db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_food_logs_user_date 
        ON food_logs(user_id, logged_at);
      `);

      // ============================================
      // CHAT MESSAGES TABLE
      // ============================================
      db.execSync(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          synced_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Index for faster retrieval
      db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_chat_messages_user 
        ON chat_messages(user_id, timestamp);
      `);

      // ============================================
      // HABIT LOGS TABLE
      // ============================================
      db.execSync(`
        CREATE TABLE IF NOT EXISTS habit_logs (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          habit_type TEXT NOT NULL,
          value TEXT NOT NULL,
          unit TEXT,
          notes TEXT,
          logged_at TEXT NOT NULL,
          synced_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Index for faster date and type queries
      db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date 
        ON habit_logs(user_id, logged_at);
      `);

      db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_habit_logs_type 
        ON habit_logs(user_id, habit_type, logged_at);
      `);

      // ============================================
      // EXERCISE LOGS TABLE
      // ============================================
      db.execSync(`
        CREATE TABLE IF NOT EXISTS exercise_logs (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          exercise_type TEXT NOT NULL,
          duration_minutes INTEGER NOT NULL,
          calories_burned INTEGER NOT NULL,
          distance_km REAL,
          steps INTEGER,
          avg_heart_rate INTEGER,
          source TEXT NOT NULL DEFAULT 'manual',
          logged_at TEXT NOT NULL,
          metadata TEXT,
          synced_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Index for faster date queries
      db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date 
        ON exercise_logs(user_id, logged_at);
      `);

      // ============================================
      // APP SETTINGS TABLE
      // ============================================
      db.execSync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // ============================================
      // DB VERSION TABLE (for migration tracking)
      // ============================================
      db.execSync(`
        CREATE TABLE IF NOT EXISTS db_version (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          version INTEGER NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
  // Migration v2: Add onboarding_completed column to users
  {
    version: 2,
    up: (db: SQLiteDatabase) => {
      // Add onboarding_completed column with default value 1 (true) for existing users
      // This ensures existing users are not forced through onboarding again
      db.execSync(`
        ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 1;
      `);
    },
  },
  // Add future migrations here:
];

/**
 * Get the current database version
 */
function getCurrentVersion(db: SQLiteDatabase): number {
  try {
    const result = db.getFirstSync<{ version: number }>(
      'SELECT version FROM db_version WHERE id = 1'
    );
    return result?.version ?? 0;
  } catch {
    // Table doesn't exist yet
    return 0;
  }
}

/**
 * Set the database version
 */
function setVersion(db: SQLiteDatabase, version: number): void {
  const timestamp = new Date().toISOString();
  db.runSync(
    `INSERT OR REPLACE INTO db_version (id, version, updated_at) VALUES (1, ?, ?)`,
    [version, timestamp]
  );
}

/**
 * Run all pending migrations
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const currentVersion = getCurrentVersion(db);

  // Check current vs target version

  // Get migrations that need to be run
  const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    return;
  }

  // Run each migration in order
  for (const migration of pendingMigrations) {
    try {
      // Run the migration
      migration.up(db);

      // Update version
      setVersion(db, migration.version);
    } catch (error) {
      logger.error(`Migration v${migration.version} failed:`, error);
      throw error;
    }
  }
}
