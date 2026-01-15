/**
 * Authentication Service
 * 
 * Handles all authentication operations with Supabase.
 * Supports Email/Password, Google, and Apple Sign-In.
 */

import { getSupabaseClient } from './supabase';
import { saveSecure, deleteSecure, STORAGE_KEYS } from './secure-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// OAuth redirect URI
const redirectUri = makeRedirectUri({
  scheme: 'nutritrack',
  path: 'auth/callback',
});

export interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  if (data.session) {
    await saveSecure(STORAGE_KEYS.AUTH_TOKEN, data.session.access_token);
    if (data.session.refresh_token) {
      await saveSecure(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token);
    }
  }
  
  return { success: true, userId: data.user?.id };
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { 
    success: true, 
    userId: data.user?.id,
  };
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  // On native platforms, open the browser
  if (Platform.OS !== 'web' && data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    
    if (result.type === 'success' && result.url) {
      // Extract tokens from URL
      const url = new URL(result.url);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      
      if (accessToken) {
        await saveSecure(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      }
      if (refreshToken) {
        await saveSecure(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      
      return { success: true };
    }
    
    return { success: false, error: 'Authentication was cancelled' };
  }
  
  return { success: true };
}

/**
 * Sign in with Apple
 */
export async function signInWithApple(): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  // On native platforms, open the browser
  if (Platform.OS !== 'web' && data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    
    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      
      if (accessToken) {
        await saveSecure(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      }
      if (refreshToken) {
        await saveSecure(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      
      return { success: true };
    }
    
    return { success: false, error: 'Authentication was cancelled' };
  }
  
  return { success: true };
}

/**
 * Sign out
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.auth.signOut();
  
  // Clear secure storage regardless of error
  await deleteSecure(STORAGE_KEYS.AUTH_TOKEN);
  await deleteSecure(STORAGE_KEYS.REFRESH_TOKEN);
  await deleteSecure(STORAGE_KEYS.USER_ID);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    return null;
  }
  
  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    return null;
  }
  
  return data.user;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectUri}?type=recovery`,
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}
