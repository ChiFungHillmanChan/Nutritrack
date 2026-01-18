/**
 * User Repository
 *
 * CRUD operations for user profiles in SQLite.
 * Sensitive health data is encrypted at rest using lib/crypto.
 */

import { User, DailyTargets, MedicalCondition, Medication, Supplement } from '../../../types';
import {
  getDatabase,
  generateId,
  getCurrentTimestamp,
  parseJSON,
  stringifyJSON,
} from '../database';
import { encryptJSON, decryptJSON, isEncrypted } from '../../../lib/crypto';

interface UserRow {
  id: string;
  email: string;
  name: string;
  gender: string | null;
  date_of_birth: string | null;
  height_cm: number;
  weight_kg: number;
  activity_level: string | null;
  goal: string;
  health_goals: string;
  medical_conditions: string;
  medications: string;
  supplements: string;
  allergies: string;
  dietary_preferences: string;
  daily_targets: string;
  notification_settings: string | null;
  onboarding_completed: number;
  is_demo_user: number;
  created_at: string;
  updated_at: string;
}

/**
 * Decrypt sensitive field with backwards compatibility for unencrypted data.
 * If the data appears to be encrypted, decrypt it. Otherwise, parse as JSON.
 */
async function decryptSensitiveField<T>(data: string, defaultValue: T): Promise<T> {
  if (!data) return defaultValue;

  if (isEncrypted(data)) {
    return decryptJSON<T>(data, defaultValue);
  }

  // Backwards compatibility: parse as plain JSON for unencrypted data
  return parseJSON<T>(data, defaultValue);
}

/**
 * Convert database row to User object
 * Decrypts sensitive health data fields
 */
async function rowToUser(row: UserRow): Promise<User> {
  // Decrypt sensitive fields (with backwards compatibility for unencrypted data)
  const medicalConditions = await decryptSensitiveField<MedicalCondition[]>(row.medical_conditions, []);
  const medications = await decryptSensitiveField<Medication[]>(row.medications, []);
  const supplements = await decryptSensitiveField<Supplement[]>(row.supplements, []);
  const allergies = await decryptSensitiveField<string[]>(row.allergies, []);

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    gender: row.gender as User['gender'],
    date_of_birth: row.date_of_birth ?? undefined,
    height_cm: row.height_cm,
    weight_kg: row.weight_kg,
    activity_level: row.activity_level as User['activity_level'],
    goal: row.goal as User['goal'],
    health_goals: parseJSON(row.health_goals, []),
    medical_conditions: medicalConditions,
    medications: medications,
    supplements: supplements,
    allergies: allergies,
    dietary_preferences: parseJSON(row.dietary_preferences, []),
    daily_targets: parseJSON<DailyTargets>(row.daily_targets, {
      calories: { min: 1800, max: 2200 },
      protein: { min: 100, max: 150 },
      carbs: { min: 200, max: 300 },
      fat: { min: 50, max: 80 },
      fiber: { min: 25, max: 35 },
      sodium: { min: 1500, max: 2300 },
      water: 2000,
    }),
    notification_settings: row.notification_settings
      ? parseJSON(row.notification_settings, undefined)
      : undefined,
    onboarding_completed: row.onboarding_completed === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const db = getDatabase();
  const row = db.getFirstSync<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  return row ? await rowToUser(row) : null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDatabase();
  const row = db.getFirstSync<UserRow>('SELECT * FROM users WHERE email = ?', [email]);
  return row ? await rowToUser(row) : null;
}

/**
 * Get the demo user (creates if doesn't exist)
 */
export async function getDemoUser(): Promise<User> {
  const db = getDatabase();
  let row = db.getFirstSync<UserRow>('SELECT * FROM users WHERE is_demo_user = 1');

  if (!row) {
    // Create demo user
    const demoUser = await createDemoUser();
    row = db.getFirstSync<UserRow>('SELECT * FROM users WHERE id = ?', [demoUser.id]);
  }

  return await rowToUser(row!);
}

/**
 * Create a new demo user (requires onboarding completion)
 * Encrypts sensitive health data fields
 */
async function createDemoUser(): Promise<User> {
  const db = getDatabase();
  const timestamp = getCurrentTimestamp();
  const id = 'demo-user-001';

  // Default daily targets (will be recalculated during onboarding)
  const dailyTargets: DailyTargets = {
    calories: { min: 1800, max: 2200 },
    protein: { min: 100, max: 150 },
    carbs: { min: 200, max: 300 },
    fat: { min: 50, max: 80 },
    fiber: { min: 25, max: 35 },
    sodium: { min: 1500, max: 2300 },
    water: 2000,
  };

  // Encrypt sensitive health data fields (empty arrays for demo user)
  const encryptedMedicalConditions = await encryptJSON<string[]>([]);
  const encryptedMedications = await encryptJSON<string[]>([]);
  const encryptedSupplements = await encryptJSON<string[]>([]);
  const encryptedAllergies = await encryptJSON<string[]>([]);

  db.runSync(
    `INSERT INTO users (
      id, email, name, gender, date_of_birth, height_cm, weight_kg,
      activity_level, goal, health_goals, medical_conditions,
      medications, supplements, allergies, dietary_preferences,
      daily_targets, onboarding_completed, is_demo_user, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      'demo@nutritrack.app',
      '', // Empty name - will be set in onboarding
      null, // No gender - will be set in onboarding
      null, // No date of birth - will be set in onboarding
      170, // Default height
      65, // Default weight
      'moderate', // Default activity level
      'maintain', // Default goal
      stringifyJSON([]),
      encryptedMedicalConditions,
      encryptedMedications,
      encryptedSupplements,
      encryptedAllergies,
      stringifyJSON([]),
      stringifyJSON(dailyTargets),
      0, // onboarding_completed = false
      1, // is_demo_user = true
      timestamp,
      timestamp,
    ]
  );

  const createdUser = await getUserById(id);
  return createdUser!;
}

/**
 * Create a new user
 * Encrypts sensitive health data fields
 */
export async function createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const db = getDatabase();
  const id = generateId();
  const timestamp = getCurrentTimestamp();

  // Encrypt sensitive health data fields
  const encryptedMedicalConditions = await encryptJSON(data.medical_conditions ?? []);
  const encryptedMedications = await encryptJSON(data.medications ?? []);
  const encryptedSupplements = await encryptJSON(data.supplements ?? []);
  const encryptedAllergies = await encryptJSON(data.allergies ?? []);

  db.runSync(
    `INSERT INTO users (
      id, email, name, gender, date_of_birth, height_cm, weight_kg,
      activity_level, goal, health_goals, medical_conditions,
      medications, supplements, allergies, dietary_preferences,
      daily_targets, notification_settings, onboarding_completed, is_demo_user, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.email,
      data.name,
      data.gender ?? null,
      data.date_of_birth ?? null,
      data.height_cm,
      data.weight_kg,
      data.activity_level ?? 'moderate',
      data.goal,
      stringifyJSON(data.health_goals),
      encryptedMedicalConditions,
      encryptedMedications,
      encryptedSupplements,
      encryptedAllergies,
      stringifyJSON(data.dietary_preferences),
      stringifyJSON(data.daily_targets),
      data.notification_settings ? stringifyJSON(data.notification_settings) : null,
      data.onboarding_completed ? 1 : 0,
      0, // is_demo_user = false for regular users
      timestamp,
      timestamp,
    ]
  );

  const createdUser = await getUserById(id);
  return createdUser!;
}

/**
 * Update user profile
 * Encrypts sensitive health data fields when updating
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = getDatabase();
  const existing = await getUserById(id);
  if (!existing) return null;

  const timestamp = getCurrentTimestamp();

  // Build update fields dynamically
  const fields: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [timestamp];

  if (updates.email !== undefined) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.gender !== undefined) {
    fields.push('gender = ?');
    values.push(updates.gender);
  }
  if (updates.date_of_birth !== undefined) {
    fields.push('date_of_birth = ?');
    values.push(updates.date_of_birth);
  }
  if (updates.height_cm !== undefined) {
    fields.push('height_cm = ?');
    values.push(updates.height_cm);
  }
  if (updates.weight_kg !== undefined) {
    fields.push('weight_kg = ?');
    values.push(updates.weight_kg);
  }
  if (updates.activity_level !== undefined) {
    fields.push('activity_level = ?');
    values.push(updates.activity_level);
  }
  if (updates.goal !== undefined) {
    fields.push('goal = ?');
    values.push(updates.goal);
  }
  if (updates.health_goals !== undefined) {
    fields.push('health_goals = ?');
    values.push(stringifyJSON(updates.health_goals));
  }
  // Encrypt sensitive health data fields
  if (updates.medical_conditions !== undefined) {
    fields.push('medical_conditions = ?');
    values.push(await encryptJSON(updates.medical_conditions));
  }
  if (updates.medications !== undefined) {
    fields.push('medications = ?');
    values.push(await encryptJSON(updates.medications));
  }
  if (updates.supplements !== undefined) {
    fields.push('supplements = ?');
    values.push(await encryptJSON(updates.supplements));
  }
  if (updates.allergies !== undefined) {
    fields.push('allergies = ?');
    values.push(await encryptJSON(updates.allergies));
  }
  if (updates.dietary_preferences !== undefined) {
    fields.push('dietary_preferences = ?');
    values.push(stringifyJSON(updates.dietary_preferences));
  }
  if (updates.daily_targets !== undefined) {
    fields.push('daily_targets = ?');
    values.push(stringifyJSON(updates.daily_targets));
  }
  if (updates.notification_settings !== undefined) {
    fields.push('notification_settings = ?');
    values.push(updates.notification_settings ? stringifyJSON(updates.notification_settings) : null);
  }
  if (updates.onboarding_completed !== undefined) {
    fields.push('onboarding_completed = ?');
    values.push(updates.onboarding_completed ? 1 : 0);
  }

  values.push(id);

  db.runSync(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  return await getUserById(id);
}

/**
 * Delete user and all related data
 */
export function deleteUser(id: string): boolean {
  const db = getDatabase();
  const result = db.runSync('DELETE FROM users WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Check if any user exists (for determining if this is first launch)
 */
export function hasAnyUser(): boolean {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM users');
  return (result?.count ?? 0) > 0;
}

/**
 * Get the current logged-in user (the most recently updated non-demo user, or demo user)
 */
export async function getCurrentUser(): Promise<User | null> {
  const db = getDatabase();
  // First try to get a non-demo user
  let row = db.getFirstSync<UserRow>(
    'SELECT * FROM users WHERE is_demo_user = 0 ORDER BY updated_at DESC LIMIT 1'
  );

  // If no regular user, get demo user
  if (!row) {
    row = db.getFirstSync<UserRow>('SELECT * FROM users WHERE is_demo_user = 1');
  }

  return row ? await rowToUser(row) : null;
}
