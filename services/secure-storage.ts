/**
 * Secure Storage Service
 * 
 * Wrapper around expo-secure-store for secure token management.
 * Never use AsyncStorage for sensitive data!
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'nutritrack_auth_token',
  REFRESH_TOKEN: 'nutritrack_refresh_token',
  USER_ID: 'nutritrack_user_id',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Save a value securely
 */
export async function saveSecure(key: StorageKey, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    // On web, use sessionStorage for sensitive data (cleared on tab close)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(key, value);
    }
    return;
  }
  
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

/**
 * Get a securely stored value
 */
export async function getSecure(key: StorageKey): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem(key);
    }
    return null;
  }
  
  return SecureStore.getItemAsync(key);
}

/**
 * Delete a securely stored value
 */
export async function deleteSecure(key: StorageKey): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(key);
    }
    return;
  }
  
  await SecureStore.deleteItemAsync(key);
}

/**
 * Clear all secure storage
 */
export async function clearAllSecure(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS);
  
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      keys.forEach(key => window.sessionStorage.removeItem(key));
    }
    return;
  }
  
  await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
}

// Export storage keys for external use
export { STORAGE_KEYS };
