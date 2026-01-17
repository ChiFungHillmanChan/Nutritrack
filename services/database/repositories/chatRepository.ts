/**
 * Chat Repository
 *
 * CRUD operations for chat messages in SQLite.
 */

import { generateId, getCurrentTimestamp, getDatabase } from '../database';

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessageRow {
  id: string;
  user_id: string;
  role: string;
  content: string;
  timestamp: string;
  synced_at: string | null;
}

/**
 * Convert database row to ChatMessage object
 */
function rowToChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    user_id: row.user_id,
    role: row.role as ChatMessage['role'],
    content: row.content,
    timestamp: row.timestamp,
  };
}

/**
 * Get chat message by ID
 */
export function getChatMessageById(id: string): ChatMessage | null {
  const db = getDatabase();
  const row = db.getFirstSync<ChatMessageRow>('SELECT * FROM chat_messages WHERE id = ?', [id]);
  return row ? rowToChatMessage(row) : null;
}

/**
 * Get all chat messages for a user
 */
export function getChatMessagesByUserId(userId: string): ChatMessage[] {
  const db = getDatabase();
  const rows = db.getAllSync<ChatMessageRow>(
    'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp ASC',
    [userId]
  );
  return rows.map(rowToChatMessage);
}

/**
 * Get recent chat messages (with limit)
 */
export function getRecentChatMessages(userId: string, limit: number = 50): ChatMessage[] {
  const db = getDatabase();
  const rows = db.getAllSync<ChatMessageRow>(
    `SELECT * FROM (
      SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
    ) ORDER BY timestamp ASC`,
    [userId, limit]
  );
  return rows.map(rowToChatMessage);
}

/**
 * Create a new chat message
 */
export function createChatMessage(
  data: Omit<ChatMessage, 'id' | 'timestamp'>
): ChatMessage {
  const db = getDatabase();
  const id = generateId();
  const timestamp = getCurrentTimestamp();

  db.runSync(
    `INSERT INTO chat_messages (id, user_id, role, content, timestamp, synced_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.user_id, data.role, data.content, timestamp, null]
  );

  return getChatMessageById(id)!;
}

/**
 * Create multiple chat messages at once
 */
export function createChatMessages(
  messages: Array<Omit<ChatMessage, 'id' | 'timestamp'>>
): ChatMessage[] {
  return messages.map((msg) => createChatMessage(msg));
}

/**
 * Delete a chat message
 */
export function deleteChatMessage(id: string): boolean {
  const db = getDatabase();
  const result = db.runSync('DELETE FROM chat_messages WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Delete all chat messages for a user
 */
export function deleteAllChatMessages(userId: string): number {
  const db = getDatabase();
  const result = db.runSync('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
  return result.changes;
}

/**
 * Clear chat history for a user (keeps welcome message concept - just deletes all)
 */
export function clearChatHistory(userId: string): void {
  deleteAllChatMessages(userId);
}

/**
 * Get chat history formatted for AI context (excludes system messages)
 */
export function getChatHistoryForAI(
  userId: string,
  limit: number = 20
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages = getRecentChatMessages(userId, limit);
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Get unsynced chat messages (for cloud sync)
 */
export function getUnsyncedChatMessages(userId: string): ChatMessage[] {
  const db = getDatabase();
  const rows = db.getAllSync<ChatMessageRow>(
    'SELECT * FROM chat_messages WHERE user_id = ? AND synced_at IS NULL ORDER BY timestamp ASC',
    [userId]
  );
  return rows.map(rowToChatMessage);
}

/**
 * Mark chat messages as synced
 */
export function markChatMessagesSynced(ids: string[]): void {
  if (ids.length === 0) return;
  const db = getDatabase();
  const timestamp = getCurrentTimestamp();
  const placeholders = ids.map(() => '?').join(',');
  db.runSync(
    `UPDATE chat_messages SET synced_at = ? WHERE id IN (${placeholders})`,
    [timestamp, ...ids]
  );
}

/**
 * Get message count for a user
 */
export function getChatMessageCount(userId: string): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ?',
    [userId]
  );
  return result?.count ?? 0;
}

/**
 * Create initial welcome message for a user
 * @param userId - The user ID
 * @param welcomeText - The translated welcome message text
 */
export function createWelcomeMessage(userId: string, welcomeText: string): ChatMessage {
  return createChatMessage({
    user_id: userId,
    role: 'assistant',
    content: welcomeText,
  });
}

/**
 * Ensure user has at least a welcome message
 * @param userId - The user ID
 * @param welcomeText - The translated welcome message text
 */
export function ensureWelcomeMessage(userId: string, welcomeText: string): void {
  const count = getChatMessageCount(userId);
  if (count === 0) {
    createWelcomeMessage(userId, welcomeText);
  }
}

/**
 * Update the welcome message content (first assistant message)
 * Used when language changes to update the greeting
 * @param userId - The user ID
 * @param newWelcomeText - The new translated welcome message text
 */
export function updateWelcomeMessage(userId: string, newWelcomeText: string): boolean {
  const db = getDatabase();
  // Get the first message (should be the welcome message)
  const firstMessage = db.getFirstSync<ChatMessageRow>(
    'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp ASC LIMIT 1',
    [userId]
  );
  
  if (firstMessage && firstMessage.role === 'assistant') {
    db.runSync(
      'UPDATE chat_messages SET content = ? WHERE id = ?',
      [newWelcomeText, firstMessage.id]
    );
    return true;
  }
  return false;
}
