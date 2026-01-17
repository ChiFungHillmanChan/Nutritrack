/**
 * Authentication Service
 *
 * Handles all authentication operations with Supabase.
 * Supports Email/Password, Google, and Apple Sign-In.
 * Supports DEMO MODE when Supabase is not configured.
 * 
 * For native platforms (iOS/Android), uses native sign-in flows for better UX.
 * For web, uses OAuth redirect flow.
 * 
 * IMPORTANT: Supabase handles all token storage internally via its storage adapter.
 * We do NOT store tokens separately - this follows industry best practices:
 * - Single source of truth for auth state
 * - No duplicate storage
 * - Supabase manages token refresh automatically
 */

import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

import { getSupabaseClient, isDemoMode } from './supabase';
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

  // Supabase automatically stores the session via its storage adapter
  // No need to store tokens separately - this avoids duplicate storage
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
      // Supabase handles session storage automatically
      // Just return success - no need to manually store tokens
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
      // Supabase handles session storage automatically
      // Just return success - no need to manually store tokens
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
