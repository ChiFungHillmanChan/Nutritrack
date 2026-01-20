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
  type SocialUserMetadata,
} from './social-auth';
import { createLogger } from '../lib/logger';

const logger = createLogger('[Auth]');

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
  email?: string;
  userMetadata?: SocialUserMetadata;
}

// Re-export for convenience
export type { SocialUserMetadata };

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
 * 
 * Handles email already exists scenario:
 * - If email is already registered (via email/password or social login),
 *   Supabase returns "User already registered" error
 * - We detect this and return a user-friendly error message
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
    // Check for email already exists error
    // Supabase returns this when the email is already registered
    // This includes emails registered via Google/Apple OAuth
    const errorMessage = error.message.toLowerCase();
    if (
      errorMessage.includes('user already registered') ||
      errorMessage.includes('email already') ||
      errorMessage.includes('already exists') ||
      errorMessage.includes('already been registered')
    ) {
      return { 
        success: false, 
        error: 'EMAIL_ALREADY_EXISTS' // Use a constant for client-side translation
      };
    }
    return { success: false, error: error.message };
  }

  // Supabase may return a user but with identities as empty array if email exists
  // This happens when "Confirm email" is disabled and user tries to sign up with existing email
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { 
      success: false, 
      error: 'EMAIL_ALREADY_EXISTS'
    };
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
  const startTime = Date.now();
  logger.debug('signInWithGoogle called');
  
  // Demo mode - not supported
  if (isDemoMode()) {
    logger.debug('Demo mode - Google login not supported');
    return { success: false, error: '示範模式唔支援 Google 登入，請用電郵登入' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    logger.error('Supabase not configured');
    return { success: false, error: 'Supabase not configured' };
  }

  // Use native Google Sign-In on mobile platforms
  logger.debug('Platform:', Platform.OS, 'isGoogleSignInAvailable:', isGoogleSignInAvailable());
  if (Platform.OS !== 'web' && isGoogleSignInAvailable()) {
    logger.debug('Using native Google Sign-In...');
    const nativeStartTime = Date.now();
    const result = await nativeGoogleSignIn();
    logger.debug('Native Google Sign-In completed:', Date.now() - nativeStartTime, 'ms');
    logger.debug('Native result:', { success: result.success, hasError: !!result.error, hasUser: !!result.user });
    
    if (result.error === 'cancelled') {
      logger.debug('User cancelled Google login');
      return { success: false, error: '登入已取消' };
    }
    
    if (!result.success) {
      logger.error('Native Google login failed:', result.error);
      return { success: false, error: result.error ?? 'Google 登入失敗' };
    }
    
    // Session is already stored by Supabase auth
    logger.info('Google login SUCCESS! Total time:', Date.now() - startTime, 'ms');
    return { 
      success: true, 
      userId: result.user?.id, 
      email: result.user?.email,
      userMetadata: result.userMetadata,
    };
  }

  // Fall back to web OAuth
  logger.debug('Using web OAuth fallback...');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });

  if (error) {
    logger.error('Web OAuth error:', error);
    return { success: false, error: error.message };
  }

  // On native platforms, open the browser
  if (Platform.OS !== 'web' && data.url) {
    logger.debug('Opening browser for OAuth...');
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    logger.debug('Browser result:', result.type);

    if (result.type === 'success' && result.url) {
      // Supabase handles session storage automatically
      // Just return success - no need to manually store tokens
      logger.info('Web OAuth SUCCESS! Total time:', Date.now() - startTime, 'ms');
      return { success: true };
    }

    logger.debug('Web OAuth cancelled or failed');
    return { success: false, error: '登入已取消' };
  }

  logger.debug('Web OAuth completed (web platform)');
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
    return { 
      success: true, 
      userId: result.user?.id,
      email: result.user?.email,
      userMetadata: result.userMetadata,
    };
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
 * 
 * WORKAROUND: Supabase's signOut can hang on iOS, similar to setSession.
 * We use a timeout to prevent the app from freezing.
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

  // Use a timeout to prevent hanging on iOS
  try {
    const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
      setTimeout(() => reject(new Error('SignOut timeout')), 3000);
    });
    
    const signOutPromise = supabase.auth.signOut({ scope: 'local' });
    
    await Promise.race([signOutPromise, timeoutPromise]).catch(() => {
      // Ignore timeout or errors - we'll clear storage manually anyway
      logger.debug('SignOut timed out or failed, continuing with local cleanup');
    });
  } catch {
    // Ignore errors - the important thing is clearing local state
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
