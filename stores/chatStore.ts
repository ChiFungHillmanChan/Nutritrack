/**
 * Chat Store - Zustand State Management
 *
 * Manages AI chat conversation history.
 * Uses local SQLite database for persistence.
 */

import { create } from 'zustand';
import { ChatMessage, chatRepository } from '../services/database';
import { createLogger } from '../lib/logger';

const logger = createLogger('[ChatStore]');

interface ChatState {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  currentUserId: string | null;

  // Actions
  initializeChat: (userId: string, welcomeMessage: string) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'user_id'>) => void;
  clearChat: (welcomeMessage: string) => void;
  setLoading: (loading: boolean) => void;
  updateWelcomeMessage: (newWelcomeText: string) => void;
  
  // Get chat history for AI context
  getChatHistory: () => Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  currentUserId: null,

  // Initialize chat for a user - loads from SQLite
  initializeChat: (userId: string, welcomeMessage: string) => {
    try {
      // Ensure welcome message exists
      chatRepository.ensureWelcomeMessage(userId, welcomeMessage);
      
      // Load messages from SQLite
      const messages = chatRepository.getRecentChatMessages(userId, 100);
      
      set({
        messages,
        currentUserId: userId,
      });
    } catch (error) {
      logger.error(' Initialize error:', error);
      set({ messages: [], currentUserId: userId });
    }
  },

  // Add a single message
  addMessage: (message) => {
    const { currentUserId } = get();
    if (!currentUserId) {
      logger.error(' No user ID set');
      return;
    }

    try {
      // Save to SQLite
      const newMessage = chatRepository.createChatMessage({
        user_id: currentUserId,
        role: message.role,
        content: message.content,
      });

      if (newMessage) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    } catch (error) {
      logger.error(' Add message error:', error);
    }
  },

  // Clear all messages and reset to welcome message
  clearChat: (welcomeMessage: string) => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    try {
      // Clear in SQLite
      chatRepository.clearChatHistory(currentUserId);
      
      // Create new welcome message
      const newWelcomeMessage = chatRepository.createWelcomeMessage(currentUserId, welcomeMessage);
      
      set({
        messages: newWelcomeMessage ? [newWelcomeMessage] : [],
      });
    } catch (error) {
      logger.error(' Clear chat error:', error);
    }
  },

  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Get chat history for AI context (excludes welcome message)
  getChatHistory: () => {
    const { messages } = get();
    // Skip the first welcome message when building context
    return messages.slice(1).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  },

  // Update welcome message when language changes
  updateWelcomeMessage: (newWelcomeText: string) => {
    const { currentUserId, messages } = get();
    if (!currentUserId) return;

    try {
      // Update in SQLite
      const updated = chatRepository.updateWelcomeMessage(currentUserId, newWelcomeText);
      
      if (updated && messages.length > 0) {
        // Update in memory state
        const updatedMessages = [...messages];
        if (updatedMessages[0].role === 'assistant') {
          updatedMessages[0] = { ...updatedMessages[0], content: newWelcomeText };
          set({ messages: updatedMessages });
        }
      }
    } catch (error) {
      logger.error(' Update welcome message error:', error);
    }
  },
}));

// Re-export ChatMessage type for convenience
export type { ChatMessage };
