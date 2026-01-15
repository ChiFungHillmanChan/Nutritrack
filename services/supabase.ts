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
 * Check if app is running in demo mode (no Supabase configured)
 */
export function isDemoMode(): boolean {
  return !SUPABASE_URL || !SUPABASE_ANON_KEY;
}

/**
 * Secure storage adapter for Supabase auth
 * Uses SecureStore on native platforms, localStorage on web
 */
const secureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
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
