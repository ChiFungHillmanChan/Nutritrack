/**
 * Database Service
 *
 * SQLite database connection and initialization.
 * Production-ready for iOS/Android App Store deployment.
 */

import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

const DATABASE_NAME = 'nutritrack.db';

// Database instance (singleton)
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the database instance
 * Creates connection if not already established
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return db;
}

/**
 * Initialize the database
 * Should be called on app startup
 */
export async function initializeDatabase(): Promise<void> {
  const database = getDatabase();

  // Enable foreign keys
  database.execSync('PRAGMA foreign_keys = ON;');

  // Run migrations
  await runMigrations(database);

  // Database initialized successfully
}

/**
 * Close the database connection
 * Call on app cleanup if needed
 */
export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}

/**
 * Generate a unique ID for new records
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Helper to safely parse JSON from database
 */
export function parseJSON<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Helper to stringify JSON for database storage
 */
export function stringifyJSON(value: unknown): string {
  return JSON.stringify(value);
}
