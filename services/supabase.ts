/**
 * Supabase Client Service
 *
 * Handles Supabase client initialization with secure token storage.
 * Uses expo-secure-store for secure token persistence.
 * Supports DEMO MODE when Supabase credentials are not configured.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Supabase configuration - these will be set via environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Check if a URL is a placeholder value (not properly configured)
 */
function isPlaceholderUrl(url: string): boolean {
  if (!url) return true;
  // Detect common placeholder patterns
  const placeholderPatterns = [
    'your-project-id',
    'your-supabase-url',
    'placeholder',
    'example.com',
    'localhost', // Also consider localhost as demo for web testing
  ];
  const lowerUrl = url.toLowerCase();
  return placeholderPatterns.some(pattern => lowerUrl.includes(pattern));
}

/**
 * Check if an API key is a placeholder value
 */
function isPlaceholderKey(key: string): boolean {
  if (!key) return true;
  const placeholderPatterns = [
    'your-anon-key',
    'your-key',
    'placeholder',
    'xxxxx',
  ];
  const lowerKey = key.toLowerCase();
  return placeholderPatterns.some(pattern => lowerKey.includes(pattern));
}

/**
 * Check if app is running in demo mode (no Supabase configured)
 */
export function isDemoMode(): boolean {
  return !SUPABASE_URL || 
         !SUPABASE_ANON_KEY || 
         isPlaceholderUrl(SUPABASE_URL) || 
         isPlaceholderKey(SUPABASE_ANON_KEY);
}

/**
 * SecureStore has a 2048 byte limit per item.
 * This adapter chunks large values to work around this limitation.
 */
const CHUNK_SIZE = 1800; // Leave some margin below 2048

/**
 * Secure storage adapter for Supabase auth
 * Uses SecureStore on native platforms, localStorage on web
 * Handles large values by chunking them
 */
const secureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    
    // Try to get the value directly first
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) {
      return value;
    }
    
    // Check if it's chunked
    const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (!chunkCountStr) {
      return null;
    }
    
    const chunkCount = parseInt(chunkCountStr, 10);
    const chunks: string[] = [];
    
    for (let i = 0; i < chunkCount; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
      if (chunk === null) {
        return null; // Corrupted data
      }
      chunks.push(chunk);
    }
    
    return chunks.join('');
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    
    // Clear any existing chunks first
    await secureStorageAdapter.removeItem(key);
    
    // If value is small enough, store directly
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      return;
    }
    
    // Chunk the value
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    
    // Store chunk count
    await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString(), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    
    // Store each chunk
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}_${i}`, chunks[i], {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return;
    }
    
    // Try to delete the direct value
    await SecureStore.deleteItemAsync(key);
    
    // Check for and delete chunks
    const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCountStr) {
      const chunkCount = parseInt(chunkCountStr, 10);
      for (let i = 0; i < chunkCount; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_chunks`);
    }
  },
};

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client instance
 * Creates a singleton instance with secure storage
 * Returns null in demo mode
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (isDemoMode()) {
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: secureStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseInstance;
}

/**
 * Convenience export for direct usage
 */
export const supabase = {
  get client() {
    return getSupabaseClient();
  },
};
