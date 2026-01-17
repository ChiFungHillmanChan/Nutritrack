/**
 * Authentication Service
 *
 * Handles all authentication operations with Supabase.
 * Supports Email/Password, Google, and Apple Sign-In.
 * Supports DEMO MODE when Supabase is not configured.
 * 
 * For native platforms (iOS/Android), uses native sign-in flows for better UX.
 * For web, uses OAuth redirect flow.
 */

import { getSupabaseClient, isDemoMode } from './supabase';
import { saveSecure, deleteSecure, STORAGE_KEYS } from './secure-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import {
  signInWithApple as nativeAppleSignIn,
  signInWithGoogle as nativeGoogleSignIn,
  isAppleSignInAvailable,
  isGoogleSignInAvailable,
} from './social-auth';

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
  // Demo mode - always succeed
  if (isDemoMode()) {
    return { success: true, userId: 'demo-user-001' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

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
  // Demo mode - always succeed
  if (isDemoMode()) {
    return { success: true, userId: 'demo-user-001' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

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
 * 
 * Uses native Google Sign-In on mobile platforms for better UX.
 * Falls back to web OAuth on web platform.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  // Demo mode - not supported
  if (isDemoMode()) {
    return { success: false, error: '示範模式唔支援 Google 登入，請用電郵登入' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Use native Google Sign-In on mobile platforms
  if (Platform.OS !== 'web' && isGoogleSignInAvailable()) {
    const result = await nativeGoogleSignIn();
    
    if (result.error === 'cancelled') {
      return { success: false, error: '登入已取消' };
    }
    
    if (!result.success) {
      return { success: false, error: result.error ?? 'Google 登入失敗' };
    }
    
    // Session is already stored by Supabase auth
    return { success: true, userId: result.user?.id };
  }

  // Fall back to web OAuth
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

    return { success: false, error: '登入已取消' };
  }

  return { success: true };
}

/**
 * Sign in with Apple
 * 
 * Uses native Apple Sign-In on iOS for the best user experience.
 * Falls back to web OAuth on other platforms.
 */
export async function signInWithApple(): Promise<AuthResult> {
  // Demo mode - not supported
  if (isDemoMode()) {
    return { success: false, error: '示範模式唔支援 Apple 登入，請用電郵登入' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Use native Apple Sign-In on iOS
  if (Platform.OS === 'ios' && await isAppleSignInAvailable()) {
    const result = await nativeAppleSignIn();
    
    if (result.error === 'cancelled') {
      return { success: false, error: '登入已取消' };
    }
    
    if (!result.success) {
      return { success: false, error: result.error ?? 'Apple 登入失敗' };
    }
    
    // Session is already stored by Supabase auth
    return { success: true, userId: result.user?.id };
  }

  // Fall back to web OAuth for non-iOS platforms
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

    return { success: false, error: '登入已取消' };
  }

  return { success: true };
}

/**
 * Sign out
 */
export async function signOut(): Promise<AuthResult> {
  // Clear secure storage regardless of mode
  await deleteSecure(STORAGE_KEYS.AUTH_TOKEN);
  await deleteSecure(STORAGE_KEYS.REFRESH_TOKEN);
  await deleteSecure(STORAGE_KEYS.USER_ID);

  // Demo mode - always succeed
  if (isDemoMode()) {
    return { success: true };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: true };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  // Demo mode - no session
  if (isDemoMode()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

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
  // Demo mode - no user from auth
  if (isDemoMode()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

/**
 * Listen to auth state changes
 * Returns a dummy subscription in demo mode
 */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  // Demo mode - return dummy subscription
  if (isDemoMode()) {
    // Call callback once with no session
    callback('SIGNED_OUT', null);
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  }

  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  // Demo mode - not supported
  if (isDemoMode()) {
    return { success: false, error: '示範模式唔支援密碼重設' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectUri}?type=recovery`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
