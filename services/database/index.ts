/**
 * Database Service - Main Export
 *
 * Central export for all database-related functionality.
 */

// Database core
export {
  getDatabase,
  initializeDatabase,
  closeDatabase,
  generateId,
  getCurrentTimestamp,
  parseJSON,
  stringifyJSON,
} from './database';

// Migrations
export { runMigrations, CURRENT_DB_VERSION } from './migrations';

// Repositories
export * as userRepository from './repositories/userRepository';
export * as foodRepository from './repositories/foodRepository';
export * as chatRepository from './repositories/chatRepository';
export * as habitRepository from './repositories/habitRepository';
export * as exerciseRepository from './repositories/exerciseRepository';
export * as settingsRepository from './repositories/settingsRepository';

// Re-export commonly used types
export type { ChatMessage } from './repositories/chatRepository';
export type { AppSettings } from './repositories/settingsRepository';
