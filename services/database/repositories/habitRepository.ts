/**
 * Habit Repository
 *
 * CRUD operations for habit logs in SQLite.
 */

import { HabitLog, HabitType } from '../../../types';
import { getDatabase, generateId, getCurrentTimestamp } from '../database';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('[HabitRepository]');

interface HabitLogRow {
  id: string;
  user_id: string;
  habit_type: string;
  value: string;
  unit: string | null;
  notes: string | null;
  logged_at: string;
  synced_at: string | null;
}

/**
 * Convert database row to HabitLog object
 */
function rowToHabitLog(row: HabitLogRow): HabitLog {
  // Try to parse value as number, otherwise keep as string
  let value: number | string = row.value;
  const numValue = Number(row.value);
  if (!isNaN(numValue)) {
    value = numValue;
  }

  return {
    id: row.id,
    user_id: row.user_id,
    habit_type: row.habit_type as HabitType,
    value,
    unit: row.unit ?? undefined,
    notes: row.notes ?? undefined,
    logged_at: row.logged_at,
  };
}

/**
 * Get habit log by ID
 */
export function getHabitLogById(id: string): HabitLog | null {
  const db = getDatabase();
  const row = db.getFirstSync<HabitLogRow>('SELECT * FROM habit_logs WHERE id = ?', [id]);
  return row ? rowToHabitLog(row) : null;
}

/**
 * Get all habit logs for a user with optional pagination
 * @param userId - User ID
 * @param limit - Maximum number of records to return (default: 50)
 * @param offset - Number of records to skip (default: 0)
 */
export function getHabitLogsByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
): HabitLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<HabitLogRow>(
    'SELECT * FROM habit_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );
  return rows.map(rowToHabitLog);
}

/**
 * Get habit logs for a specific date
 */
export function getHabitLogsByDate(userId: string, date: Date): HabitLog[] {
  const db = getDatabase();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = db.getAllSync<HabitLogRow>(
    `SELECT * FROM habit_logs 
     WHERE user_id = ? AND logged_at >= ? AND logged_at <= ?
     ORDER BY logged_at ASC`,
    [userId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return rows.map(rowToHabitLog);
}

/**
 * Get today's habit logs for a user
 */
export function getTodayHabitLogs(userId: string): HabitLog[] {
  return getHabitLogsByDate(userId, new Date());
}

/**
 * Get habit logs by type for a user with optional pagination
 * @param userId - User ID
 * @param habitType - Type of habit
 * @param limit - Maximum number of records to return (default: 50)
 * @param offset - Number of records to skip (default: 0)
 */
export function getHabitLogsByType(
  userId: string,
  habitType: HabitType,
  limit: number = 50,
  offset: number = 0
): HabitLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<HabitLogRow>(
    'SELECT * FROM habit_logs WHERE user_id = ? AND habit_type = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?',
    [userId, habitType, limit, offset]
  );
  return rows.map(rowToHabitLog);
}

/**
 * Get today's log for a specific habit type
 */
export function getTodayHabitLog(userId: string, habitType: HabitType): HabitLog | null {
  const db = getDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const row = db.getFirstSync<HabitLogRow>(
    `SELECT * FROM habit_logs 
     WHERE user_id = ? AND habit_type = ? AND logged_at >= ? AND logged_at < ?
     ORDER BY logged_at DESC LIMIT 1`,
    [userId, habitType, today.toISOString(), tomorrow.toISOString()]
  );

  return row ? rowToHabitLog(row) : null;
}

/**
 * Get total hydration for today
 */
export function getTodayHydration(userId: string): number {
  const db = getDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = db.getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(CAST(value AS REAL)), 0) as total
     FROM habit_logs 
     WHERE user_id = ? AND habit_type = 'hydration' AND logged_at >= ? AND logged_at < ?`,
    [userId, today.toISOString(), tomorrow.toISOString()]
  );

  return result?.total ?? 0;
}

/**
 * Create a new habit log
 */
export function createHabitLog(data: Omit<HabitLog, 'id'>): HabitLog | null {
  try {
    const db = getDatabase();
    const id = generateId();

    db.runSync(
      `INSERT INTO habit_logs (id, user_id, habit_type, value, unit, notes, logged_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.user_id,
        data.habit_type,
        String(data.value),
        data.unit ?? null,
        data.notes ?? null,
        data.logged_at,
        null,
      ]
    );

    return getHabitLogById(id);
  } catch (error) {
    logger.error('Failed to create habit log:', error);
    return null;
  }
}

/**
 * Update a habit log
 */
export function updateHabitLog(id: string, updates: Partial<HabitLog>): HabitLog | null {
  try {
    const db = getDatabase();
    const existing = getHabitLogById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (updates.habit_type !== undefined) {
      fields.push('habit_type = ?');
      values.push(updates.habit_type);
    }
    if (updates.value !== undefined) {
      fields.push('value = ?');
      values.push(String(updates.value));
    }
    if (updates.unit !== undefined) {
      fields.push('unit = ?');
      values.push(updates.unit);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    // Mark as unsynced
    fields.push('synced_at = ?');
    values.push(null);

    if (fields.length === 0) return existing;

    values.push(id);
    db.runSync(`UPDATE habit_logs SET ${fields.join(', ')} WHERE id = ?`, values);

    return getHabitLogById(id);
  } catch (error) {
    logger.error('Failed to update habit log:', error);
    return null;
  }
}

/**
 * Delete a habit log
 */
export function deleteHabitLog(id: string): boolean {
  try {
    const db = getDatabase();
    const result = db.runSync('DELETE FROM habit_logs WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    logger.error('Failed to delete habit log:', error);
    return false;
  }
}

/**
 * Delete all habit logs for a user
 */
export function deleteAllHabitLogs(userId: string): number {
  try {
    const db = getDatabase();
    const result = db.runSync('DELETE FROM habit_logs WHERE user_id = ?', [userId]);
    return result.changes;
  } catch (error) {
    logger.error('Failed to delete all habit logs:', error);
    return 0;
  }
}

/**
 * Get habit logs for a date range
 */
export function getHabitLogsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
  habitType?: HabitType
): HabitLog[] {
  const db = getDatabase();

  let query = `SELECT * FROM habit_logs 
               WHERE user_id = ? AND logged_at >= ? AND logged_at <= ?`;
  const params: (string | number | null)[] = [userId, startDate.toISOString(), endDate.toISOString()];

  if (habitType) {
    query += ' AND habit_type = ?';
    params.push(habitType);
  }

  query += ' ORDER BY logged_at ASC';

  const rows = db.getAllSync<HabitLogRow>(query, params);
  return rows.map(rowToHabitLog);
}

/**
 * Get unsynced habit logs (for cloud sync)
 */
export function getUnsyncedHabitLogs(userId: string): HabitLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<HabitLogRow>(
    'SELECT * FROM habit_logs WHERE user_id = ? AND synced_at IS NULL',
    [userId]
  );
  return rows.map(rowToHabitLog);
}

/**
 * Mark habit logs as synced
 */
export function markHabitLogsSynced(ids: string[]): void {
  if (ids.length === 0) return;
  try {
    const db = getDatabase();
    const timestamp = getCurrentTimestamp();
    const placeholders = ids.map(() => '?').join(',');
    db.runSync(
      `UPDATE habit_logs SET synced_at = ? WHERE id IN (${placeholders})`,
      [timestamp, ...ids]
    );
  } catch (error) {
    logger.error('Failed to mark habit logs synced:', error);
  }
}

/**
 * Create demo habit logs for a user
 */
export function createDemoHabitLogs(userId: string): HabitLog[] {
  const timestamp = getCurrentTimestamp();

  const demoLogs = [
    {
      user_id: userId,
      habit_type: 'hydration' as const,
      value: 1500,
      unit: 'ml',
      logged_at: timestamp,
    },
    {
      user_id: userId,
      habit_type: 'mood' as const,
      value: 4,
      logged_at: timestamp,
    },
    {
      user_id: userId,
      habit_type: 'sleep_duration' as const,
      value: 7.5,
      unit: 'hours',
      logged_at: timestamp,
    },
  ];

  return demoLogs
    .map((log) => createHabitLog(log))
    .filter((log): log is HabitLog => log !== null);
}

/**
 * Calculate streak for a habit type
 */
export function calculateStreak(userId: string, habitType: HabitType): {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
} {
  const db = getDatabase();

  // Get all unique dates with this habit type, ordered by date desc
  const rows = db.getAllSync<{ date: string }>(
    `SELECT DISTINCT DATE(logged_at) as date 
     FROM habit_logs 
     WHERE user_id = ? AND habit_type = ?
     ORDER BY date DESC`,
    [userId, habitType]
  );

  if (rows.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastLoggedDate: null };
  }

  const lastLoggedDate = rows[0].date;
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if streak is active (logged today or yesterday)
  const lastLogged = new Date(lastLoggedDate);
  const diffDays = Math.floor((today.getTime() - lastLogged.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    // Streak is broken
    currentStreak = 0;
  }

  // Calculate streaks
  let prevDate: Date | null = null;
  for (const row of rows) {
    const date = new Date(row.date);

    if (prevDate === null) {
      streak = 1;
    } else {
      const diff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else {
        if (streak > longestStreak) longestStreak = streak;
        streak = 1;
      }
    }

    prevDate = date;
  }

  if (streak > longestStreak) longestStreak = streak;
  if (diffDays <= 1) currentStreak = streak;

  return { currentStreak, longestStreak, lastLoggedDate };
}
