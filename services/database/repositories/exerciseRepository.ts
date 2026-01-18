/**
 * Exercise Repository
 *
 * CRUD operations for exercise logs in SQLite.
 */

import { ExerciseLog, ExerciseType, ExerciseSource } from '../../../types';
import {
  getDatabase,
  generateId,
  getCurrentTimestamp,
  parseJSON,
  stringifyJSON,
} from '../database';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('[ExerciseRepository]');

interface ExerciseLogRow {
  id: string;
  user_id: string;
  exercise_type: string;
  duration_minutes: number;
  calories_burned: number;
  distance_km: number | null;
  steps: number | null;
  avg_heart_rate: number | null;
  source: string;
  logged_at: string;
  metadata: string | null;
  synced_at: string | null;
}

/**
 * Convert database row to ExerciseLog object
 */
function rowToExerciseLog(row: ExerciseLogRow): ExerciseLog {
  return {
    id: row.id,
    user_id: row.user_id,
    exercise_type: row.exercise_type as ExerciseType,
    duration_minutes: row.duration_minutes,
    calories_burned: row.calories_burned,
    distance_km: row.distance_km ?? undefined,
    steps: row.steps ?? undefined,
    avg_heart_rate: row.avg_heart_rate ?? undefined,
    source: row.source as ExerciseSource,
    logged_at: row.logged_at,
    metadata: row.metadata ? parseJSON(row.metadata, {}) : undefined,
  };
}

/**
 * Get exercise log by ID
 */
export function getExerciseLogById(id: string): ExerciseLog | null {
  const db = getDatabase();
  const row = db.getFirstSync<ExerciseLogRow>('SELECT * FROM exercise_logs WHERE id = ?', [id]);
  return row ? rowToExerciseLog(row) : null;
}

/**
 * Get all exercise logs for a user with optional pagination
 * @param userId - User ID
 * @param limit - Maximum number of records to return (default: 50)
 * @param offset - Number of records to skip (default: 0)
 */
export function getExerciseLogsByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
): ExerciseLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<ExerciseLogRow>(
    'SELECT * FROM exercise_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );
  return rows.map(rowToExerciseLog);
}

/**
 * Get exercise logs for a specific date
 */
export function getExerciseLogsByDate(userId: string, date: Date): ExerciseLog[] {
  const db = getDatabase();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = db.getAllSync<ExerciseLogRow>(
    `SELECT * FROM exercise_logs 
     WHERE user_id = ? AND logged_at >= ? AND logged_at <= ?
     ORDER BY logged_at ASC`,
    [userId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return rows.map(rowToExerciseLog);
}

/**
 * Get today's exercise logs for a user
 */
export function getTodayExerciseLogs(userId: string): ExerciseLog[] {
  return getExerciseLogsByDate(userId, new Date());
}

/**
 * Get exercise logs for a date range
 */
export function getExerciseLogsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): ExerciseLog[] {
  const db = getDatabase();

  const rows = db.getAllSync<ExerciseLogRow>(
    `SELECT * FROM exercise_logs 
     WHERE user_id = ? AND logged_at >= ? AND logged_at <= ?
     ORDER BY logged_at ASC`,
    [userId, startDate.toISOString(), endDate.toISOString()]
  );

  return rows.map(rowToExerciseLog);
}

/**
 * Get exercise logs by type with optional pagination
 * @param userId - User ID
 * @param exerciseType - Type of exercise
 * @param limit - Maximum number of records to return (default: 50)
 * @param offset - Number of records to skip (default: 0)
 */
export function getExerciseLogsByType(
  userId: string,
  exerciseType: ExerciseType,
  limit: number = 50,
  offset: number = 0
): ExerciseLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<ExerciseLogRow>(
    'SELECT * FROM exercise_logs WHERE user_id = ? AND exercise_type = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?',
    [userId, exerciseType, limit, offset]
  );
  return rows.map(rowToExerciseLog);
}

/**
 * Create a new exercise log
 */
export function createExerciseLog(data: Omit<ExerciseLog, 'id'>): ExerciseLog | null {
  try {
    const db = getDatabase();
    const id = generateId();

    db.runSync(
      `INSERT INTO exercise_logs (
        id, user_id, exercise_type, duration_minutes, calories_burned,
        distance_km, steps, avg_heart_rate, source, logged_at, metadata, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.user_id,
        data.exercise_type,
        data.duration_minutes,
        data.calories_burned,
        data.distance_km ?? null,
        data.steps ?? null,
        data.avg_heart_rate ?? null,
        data.source,
        data.logged_at,
        data.metadata ? stringifyJSON(data.metadata) : null,
        null,
      ]
    );

    return getExerciseLogById(id);
  } catch (error) {
    logger.error('Failed to create exercise log:', error);
    return null;
  }
}

/**
 * Update an exercise log
 */
export function updateExerciseLog(id: string, updates: Partial<ExerciseLog>): ExerciseLog | null {
  try {
    const db = getDatabase();
    const existing = getExerciseLogById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (updates.exercise_type !== undefined) {
      fields.push('exercise_type = ?');
      values.push(updates.exercise_type);
    }
    if (updates.duration_minutes !== undefined) {
      fields.push('duration_minutes = ?');
      values.push(updates.duration_minutes);
    }
    if (updates.calories_burned !== undefined) {
      fields.push('calories_burned = ?');
      values.push(updates.calories_burned);
    }
    if (updates.distance_km !== undefined) {
      fields.push('distance_km = ?');
      values.push(updates.distance_km);
    }
    if (updates.steps !== undefined) {
      fields.push('steps = ?');
      values.push(updates.steps);
    }
    if (updates.avg_heart_rate !== undefined) {
      fields.push('avg_heart_rate = ?');
      values.push(updates.avg_heart_rate);
    }
    if (updates.source !== undefined) {
      fields.push('source = ?');
      values.push(updates.source);
    }
    if (updates.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(updates.metadata ? stringifyJSON(updates.metadata) : null);
    }

    // Mark as unsynced
    fields.push('synced_at = ?');
    values.push(null);

    if (fields.length === 0) return existing;

    values.push(id);
    db.runSync(`UPDATE exercise_logs SET ${fields.join(', ')} WHERE id = ?`, values);

    return getExerciseLogById(id);
  } catch (error) {
    logger.error('Failed to update exercise log:', error);
    return null;
  }
}

/**
 * Delete an exercise log
 */
export function deleteExerciseLog(id: string): boolean {
  try {
    const db = getDatabase();
    const result = db.runSync('DELETE FROM exercise_logs WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    logger.error('Failed to delete exercise log:', error);
    return false;
  }
}

/**
 * Delete all exercise logs for a user
 */
export function deleteAllExerciseLogs(userId: string): number {
  try {
    const db = getDatabase();
    const result = db.runSync('DELETE FROM exercise_logs WHERE user_id = ?', [userId]);
    return result.changes;
  } catch (error) {
    logger.error('Failed to delete all exercise logs:', error);
    return 0;
  }
}

/**
 * Get total calories burned for today
 */
export function getTodayCaloriesBurned(userId: string): number {
  const db = getDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(calories_burned), 0) as total
     FROM exercise_logs 
     WHERE user_id = ? AND logged_at >= ? AND logged_at < ?`,
    [userId, today.toISOString(), tomorrow.toISOString()]
  );

  return result?.total ?? 0;
}

/**
 * Get total steps for today
 */
export function getTodaySteps(userId: string): number {
  const db = getDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(steps), 0) as total
     FROM exercise_logs 
     WHERE user_id = ? AND logged_at >= ? AND logged_at < ? AND steps IS NOT NULL`,
    [userId, today.toISOString(), tomorrow.toISOString()]
  );

  return result?.total ?? 0;
}

/**
 * Get total active minutes for today
 */
export function getTodayActiveMinutes(userId: string): number {
  const db = getDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(duration_minutes), 0) as total
     FROM exercise_logs 
     WHERE user_id = ? AND logged_at >= ? AND logged_at < ?`,
    [userId, today.toISOString(), tomorrow.toISOString()]
  );

  return result?.total ?? 0;
}

/**
 * Get unsynced exercise logs (for cloud sync)
 */
export function getUnsyncedExerciseLogs(userId: string): ExerciseLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<ExerciseLogRow>(
    'SELECT * FROM exercise_logs WHERE user_id = ? AND synced_at IS NULL',
    [userId]
  );
  return rows.map(rowToExerciseLog);
}

/**
 * Mark exercise logs as synced
 */
export function markExerciseLogsSynced(ids: string[]): void {
  if (ids.length === 0) return;
  try {
    const db = getDatabase();
    const timestamp = getCurrentTimestamp();
    const placeholders = ids.map(() => '?').join(',');
    db.runSync(
      `UPDATE exercise_logs SET synced_at = ? WHERE id IN (${placeholders})`,
      [timestamp, ...ids]
    );
  } catch (error) {
    logger.error('Failed to mark exercise logs synced:', error);
  }
}

/**
 * Create demo exercise logs for a user
 */
export function createDemoExerciseLogs(userId: string): ExerciseLog[] {
  const timestamp = getCurrentTimestamp();

  const demoLogs = [
    {
      user_id: userId,
      exercise_type: 'walking' as const,
      duration_minutes: 30,
      calories_burned: 120,
      steps: 3500,
      distance_km: 2.5,
      source: 'manual' as const,
      logged_at: timestamp,
    },
  ];

  return demoLogs
    .map((log) => createExerciseLog(log))
    .filter((log): log is ExerciseLog => log !== null);
}

/**
 * Get daily activity summary for a date
 */
export function getDailyActivitySummary(userId: string, date: Date): {
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  distanceKm: number;
  exerciseCount: number;
} {
  const logs = getExerciseLogsByDate(userId, date);

  return {
    steps: logs.reduce((sum, log) => sum + (log.steps ?? 0), 0),
    activeMinutes: logs.reduce((sum, log) => sum + log.duration_minutes, 0),
    caloriesBurned: logs.reduce((sum, log) => sum + log.calories_burned, 0),
    distanceKm: logs.reduce((sum, log) => sum + (log.distance_km ?? 0), 0),
    exerciseCount: logs.length,
  };
}
