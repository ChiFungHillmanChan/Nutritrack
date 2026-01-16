/**
 * Chat Store - Zustand State Management
 *
 * Manages AI chat conversation history.
 * Uses local SQLite database for persistence.
 */

import { create } from 'zustand';
import { chatRepository, ChatMessage } from '../services/database';

interface ChatState {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  currentUserId: string | null;

  // Actions
  initializeChat: (userId: string) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'user_id'>) => void;
  clearChat: () => void;
  setLoading: (loading: boolean) => void;
  
  // Get chat history for AI context
  getChatHistory: () => Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  currentUserId: null,

  // Initialize chat for a user - loads from SQLite
  initializeChat: (userId: string) => {
    try {
      // Ensure welcome message exists
      chatRepository.ensureWelcomeMessage(userId);
      
      // Load messages from SQLite
      const messages = chatRepository.getRecentChatMessages(userId, 100);
      
      set({
        messages,
        currentUserId: userId,
      });
    } catch (error) {
      console.error('[ChatStore] Initialize error:', error);
      set({ messages: [], currentUserId: userId });
    }
  },

  // Add a single message
  addMessage: (message) => {
    const { currentUserId } = get();
    if (!currentUserId) {
      console.error('[ChatStore] No user ID set');
      return;
    }

    try {
      // Save to SQLite
      const newMessage = chatRepository.createChatMessage({
        user_id: currentUserId,
        role: message.role,
        content: message.content,
      });

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    } catch (error) {
      console.error('[ChatStore] Add message error:', error);
    }
  },

  // Clear all messages and reset to welcome message
  clearChat: () => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    try {
      // Clear in SQLite
      chatRepository.clearChatHistory(currentUserId);
      
      // Create new welcome message
      const welcomeMessage = chatRepository.createWelcomeMessage(currentUserId);
      
      set({
        messages: [welcomeMessage],
      });
    } catch (error) {
      console.error('[ChatStore] Clear chat error:', error);
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
}));

// Re-export ChatMessage type for convenience
export type { ChatMessage };
