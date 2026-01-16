/**
 * Food Repository
 *
 * CRUD operations for food logs in SQLite.
 */

import { FoodLog, NutritionData } from '../../../types';
import {
  getDatabase,
  generateId,
  getCurrentTimestamp,
  parseJSON,
  stringifyJSON,
} from '../database';

interface FoodLogRow {
  id: string;
  user_id: string;
  meal_type: string;
  food_name: string;
  portion_size: number;
  nutrition_data: string;
  image_url: string | null;
  logged_at: string;
  ai_confidence: number | null;
  synced_at: string | null;
}

/**
 * Convert database row to FoodLog object
 */
function rowToFoodLog(row: FoodLogRow): FoodLog {
  return {
    id: row.id,
    user_id: row.user_id,
    meal_type: row.meal_type as FoodLog['meal_type'],
    food_name: row.food_name,
    portion_size: row.portion_size,
    nutrition_data: parseJSON<NutritionData>(row.nutrition_data, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
    }),
    image_url: row.image_url ?? undefined,
    logged_at: row.logged_at,
    ai_confidence: row.ai_confidence ?? undefined,
  };
}

/**
 * Get food log by ID
 */
export function getFoodLogById(id: string): FoodLog | null {
  const db = getDatabase();
  const row = db.getFirstSync<FoodLogRow>('SELECT * FROM food_logs WHERE id = ?', [id]);
  return row ? rowToFoodLog(row) : null;
}

/**
 * Get all food logs for a user
 */
export function getFoodLogsByUserId(userId: string): FoodLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<FoodLogRow>(
    'SELECT * FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC',
    [userId]
  );
  return rows.map(rowToFoodLog);
}

/**
 * Get food logs for a specific date
 */
export function getFoodLogsByDate(userId: string, date: Date): FoodLog[] {
  const db = getDatabase();

  // Get start and end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = db.getAllSync<FoodLogRow>(
    `SELECT * FROM food_logs 
     WHERE user_id = ? AND logged_at >= ? AND logged_at <= ?
     ORDER BY logged_at ASC`,
    [userId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return rows.map(rowToFoodLog);
}

/**
 * Get today's food logs for a user
 */
export function getTodayFoodLogs(userId: string): FoodLog[] {
  return getFoodLogsByDate(userId, new Date());
}

/**
 * Get food logs for a date range
 */
export function getFoodLogsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): FoodLog[] {
  const db = getDatabase();

  const rows = db.getAllSync<FoodLogRow>(
    `SELECT * FROM food_logs 
     WHERE user_id = ? AND logged_at >= ? AND logged_at <= ?
     ORDER BY logged_at ASC`,
    [userId, startDate.toISOString(), endDate.toISOString()]
  );

  return rows.map(rowToFoodLog);
}

/**
 * Create a new food log
 */
export function createFoodLog(data: Omit<FoodLog, 'id'>): FoodLog {
  const db = getDatabase();
  const id = generateId();

  db.runSync(
    `INSERT INTO food_logs (
      id, user_id, meal_type, food_name, portion_size,
      nutrition_data, image_url, logged_at, ai_confidence, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.user_id,
      data.meal_type,
      data.food_name,
      data.portion_size,
      stringifyJSON(data.nutrition_data),
      data.image_url ?? null,
      data.logged_at,
      data.ai_confidence ?? null,
      null,
    ]
  );

  return getFoodLogById(id)!;
}

/**
 * Update a food log
 */
export function updateFoodLog(id: string, updates: Partial<FoodLog>): FoodLog | null {
  const db = getDatabase();
  const existing = getFoodLogById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.meal_type !== undefined) {
    fields.push('meal_type = ?');
    values.push(updates.meal_type);
  }
  if (updates.food_name !== undefined) {
    fields.push('food_name = ?');
    values.push(updates.food_name);
  }
  if (updates.portion_size !== undefined) {
    fields.push('portion_size = ?');
    values.push(updates.portion_size);
  }
  if (updates.nutrition_data !== undefined) {
    fields.push('nutrition_data = ?');
    values.push(stringifyJSON(updates.nutrition_data));
  }
  if (updates.image_url !== undefined) {
    fields.push('image_url = ?');
    values.push(updates.image_url);
  }
  if (updates.ai_confidence !== undefined) {
    fields.push('ai_confidence = ?');
    values.push(updates.ai_confidence);
  }

  // Mark as unsynced when updated
  fields.push('synced_at = ?');
  values.push(null);

  if (fields.length === 0) return existing;

  values.push(id);
  db.runSync(`UPDATE food_logs SET ${fields.join(', ')} WHERE id = ?`, values);

  return getFoodLogById(id);
}

/**
 * Delete a food log
 */
export function deleteFoodLog(id: string): boolean {
  const db = getDatabase();
  const result = db.runSync('DELETE FROM food_logs WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Delete all food logs for a user
 */
export function deleteAllFoodLogs(userId: string): number {
  const db = getDatabase();
  const result = db.runSync('DELETE FROM food_logs WHERE user_id = ?', [userId]);
  return result.changes;
}

/**
 * Calculate total nutrition from food logs
 */
export function calculateTotalNutrition(logs: FoodLog[]): NutritionData {
  return logs.reduce(
    (total, log) => ({
      calories: total.calories + log.nutrition_data.calories,
      protein: total.protein + log.nutrition_data.protein,
      carbs: total.carbs + log.nutrition_data.carbs,
      fat: total.fat + log.nutrition_data.fat,
      fiber: total.fiber + log.nutrition_data.fiber,
      sodium: total.sodium + log.nutrition_data.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );
}

/**
 * Get unsynced food logs (for cloud sync)
 */
export function getUnsyncedFoodLogs(userId: string): FoodLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<FoodLogRow>(
    'SELECT * FROM food_logs WHERE user_id = ? AND synced_at IS NULL',
    [userId]
  );
  return rows.map(rowToFoodLog);
}

/**
 * Mark food logs as synced
 */
export function markFoodLogsSynced(ids: string[]): void {
  if (ids.length === 0) return;
  const db = getDatabase();
  const timestamp = getCurrentTimestamp();
  const placeholders = ids.map(() => '?').join(',');
  db.runSync(
    `UPDATE food_logs SET synced_at = ? WHERE id IN (${placeholders})`,
    [timestamp, ...ids]
  );
}

/**
 * Create demo food logs for a user
 */
export function createDemoFoodLogs(userId: string): FoodLog[] {
  const timestamp = getCurrentTimestamp();

  const demoLogs = [
    {
      user_id: userId,
      meal_type: 'breakfast' as const,
      food_name: '雞蛋三文治',
      portion_size: 200,
      nutrition_data: {
        calories: 350,
        protein: 18,
        carbs: 32,
        fat: 16,
        fiber: 2,
        sodium: 520,
      },
      logged_at: timestamp,
      ai_confidence: 0.92,
    },
    {
      user_id: userId,
      meal_type: 'lunch' as const,
      food_name: '叉燒飯',
      portion_size: 400,
      nutrition_data: {
        calories: 650,
        protein: 28,
        carbs: 85,
        fat: 22,
        fiber: 1,
        sodium: 890,
      },
      logged_at: timestamp,
      ai_confidence: 0.88,
    },
  ];

  return demoLogs.map((log) => createFoodLog(log));
}
