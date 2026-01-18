/**
 * Social Authentication Service
 * 
 * Handles Apple Sign-In and Google Sign-In for the Nutritrack app.
 * Integrates with Supabase Auth for user management.
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { getSupabaseClient } from './supabase';
import { createLogger } from '../lib/logger';

const logger = createLogger('[Social Auth]');

// Ensure web browser auth sessions are completed properly
WebBrowser.maybeCompleteAuthSession();

/**
 * Check if Apple Sign-In is available on this device
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  return await AppleAuthentication.isAvailableAsync();
}

/**
 * Check if Google Sign-In is configured (via Supabase)
 */
export function isGoogleSignInAvailable(): boolean {
  // Google Sign-In is available if Supabase is configured
  // The actual Google OAuth is configured in Supabase dashboard
  return !!getSupabaseClient();
}

/**
 * Sign in with Apple
 * 
 * Uses Supabase's native Apple provider integration.
 * Apple Sign-In is only available on iOS devices.
 */
export async function signInWithApple(): Promise<{
  success: boolean;
  error?: string;
  user?: { id: string; email: string };
}> {
  const startTime = Date.now();
  logger.debug('[Apple] Starting Apple Sign-In flow...');
  
  try {
    // Check availability
    logger.debug('[Apple] Checking availability...');
    const isAvailable = await isAppleSignInAvailable();
    logger.debug('[Apple] Apple Sign-In available:', isAvailable);
    
    if (!isAvailable) {
      return { 
        success: false, 
        error: Platform.OS === 'ios' 
          ? 'Apple Sign-In is not available on this device' 
          : 'Apple Sign-In is only available on iOS'
      };
    }

    // Generate a random nonce for security
    logger.debug('[Apple] Generating nonce...');
    const rawNonce = Crypto.getRandomValues(new Uint8Array(32))
      .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
    
    // Hash the nonce using SHA256
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );
    logger.debug('[Apple] Nonce generated:', Date.now() - startTime, 'ms');

    // Request Apple Sign-In
    logger.debug('[Apple] Opening Apple Sign-In dialog...');
    const appleStartTime = Date.now();
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    logger.debug('[Apple] Apple dialog completed:', Date.now() - appleStartTime, 'ms');
    logger.debug('[Apple] Got credential:', {
      hasIdentityToken: !!credential.identityToken,
      hasEmail: !!credential.email,
      hasFullName: !!credential.fullName,
    });

    // Verify we got an identity token
    if (!credential.identityToken) {
      logger.error('[Apple] No identity token received');
      return { success: false, error: 'No identity token received from Apple' };
    }

    // Sign in with Supabase using the Apple credential
    logger.debug('[Apple] Getting Supabase client...');
    const supabase = getSupabaseClient();
    if (!supabase) {
      logger.error('[Apple] Supabase not configured');
      return { success: false, error: 'Supabase not configured' };
    }
    
    logger.debug('[Apple] Signing in with Supabase...');
    const supabaseStartTime = Date.now();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce, // Send the raw nonce, not the hashed one
    });
    logger.debug('[Apple] Supabase sign-in completed:', Date.now() - supabaseStartTime, 'ms');

    if (error) {
      logger.error('[Apple] Supabase error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      logger.error('[Apple] No user data returned');
      return { success: false, error: 'No user data returned' };
    }

    logger.info('[Apple] SUCCESS! User authenticated:', {
      id: data.user.id,
      email: data.user.email,
      totalTime: `${Date.now() - startTime}ms`,
    });
    
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
      },
    };
  } catch (error) {
    // Handle user cancellation
    if (error instanceof Error) {
      if (error.message.includes('ERR_CANCELED') || 
          error.message.includes('The user canceled')) {
        logger.debug('[Apple] User cancelled');
        return { success: false, error: 'cancelled' };
      }
      logger.error('[Apple] Error:', error.message);
      logger.error('[Apple] Stack:', error.stack);
      logger.debug('[Apple] Total time before error:', Date.now() - startTime, 'ms');
      return { success: false, error: error.message };
    }
    logger.error('[Apple] Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign in with Google
 * 
 * Uses Supabase's OAuth flow which handles all redirect URI complexity.
 * This approach works in both Expo Go and production builds.
 * 
 * Prerequisites:
 * 1. Configure Google OAuth in Supabase Dashboard (Authentication > Providers > Google)
 * 2. Add your Supabase callback URL to Google Cloud Console
 *    (https://YOUR_PROJECT.supabase.co/auth/v1/callback)
 * 3. Configure Site URL in Supabase Dashboard (Authentication > URL Configuration)
 *    For Expo Go: Use your app's custom scheme (e.g., nutritrack://auth/callback)
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
  user?: { id: string; email: string };
}> {
  const startTime = Date.now();
  logger.debug('[Google] Starting Google Sign-In flow...');
  
  try {
    logger.debug('[Google] Getting Supabase client...');
    const supabase = getSupabaseClient();
    if (!supabase) {
      logger.error('[Google] Supabase not configured');
      return { success: false, error: 'Supabase not configured' };
    }
    logger.debug('[Google] Supabase client ready:', Date.now() - startTime, 'ms');

    // For Expo Go, we need to use a scheme-based redirect
    // The redirect URL must be configured in Supabase Dashboard under:
    // Authentication > URL Configuration > Redirect URLs
    const redirectTo = 'nutritrack://auth/callback';
    logger.debug('[Google] Redirect URL:', redirectTo);

    // Start the OAuth flow using Supabase
    // Supabase handles the Google OAuth complexity and redirects
    logger.debug('[Google] Requesting OAuth URL from Supabase...');
    const oauthStartTime = Date.now();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // We'll handle the browser ourselves
        scopes: 'openid email profile', // Explicitly request email scope
      },
    });
    logger.debug('[Google] OAuth URL request completed:', Date.now() - oauthStartTime, 'ms');

    if (error) {
      logger.error('[Google] Supabase OAuth error:', error);
      return { success: false, error: error.message };
    }

    if (!data.url) {
      logger.error('[Google] No OAuth URL returned');
      return { success: false, error: 'No OAuth URL returned' };
    }
    logger.debug('[Google] Got OAuth URL, opening browser...');

    // Open the OAuth URL in a web browser
    // Use the custom scheme for the return URL
    logger.debug('[Google] Opening auth session in browser...');
    const browserStartTime = Date.now();
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
      {
        showInRecents: true,
      }
    );
    logger.debug('[Google] Browser session completed:', Date.now() - browserStartTime, 'ms');
    logger.debug('[Google] Browser result type:', result.type);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      logger.debug('[Google] User cancelled the auth flow');
      return { success: false, error: 'cancelled' };
    }

    if (result.type !== 'success') {
      logger.error('[Google] Authentication failed:', result.type);
      return { success: false, error: `Authentication failed: ${result.type}` };
    }

    // Extract the URL parameters from the redirect
    const url = result.url;
    logger.debug('[Google] Parsing callback URL...');
    
    // Parse the URL to get the auth tokens
    // Supabase returns tokens in the URL fragment or query params
    const parsedUrl = new URL(url);
    const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
    const queryParams = parsedUrl.searchParams;
    
    // Get access token and refresh token from URL
    const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') ?? queryParams.get('refresh_token');
    
    logger.debug('[Google] Tokens found in URL:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    if (accessToken && refreshToken) {
      // Set the session manually with the tokens from the URL
      logger.debug('[Google] Setting session with tokens...');
      const sessionStartTime = Date.now();
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      logger.debug('[Google] Session set completed:', Date.now() - sessionStartTime, 'ms');

      if (sessionError) {
        logger.error('[Google] Session error:', sessionError);
        return { success: false, error: sessionError.message };
      }

      if (sessionData.user) {
        logger.info('[Google] SUCCESS! User authenticated:', {
          id: sessionData.user.id,
          email: sessionData.user.email,
          totalTime: `${Date.now() - startTime}ms`,
        });
        return {
          success: true,
          user: {
            id: sessionData.user.id,
            email: sessionData.user.email ?? '',
          },
        };
      }
    }

    // If no tokens in URL, check if session was set automatically
    logger.debug('[Google] No tokens in URL, checking existing session...');
    const { data: currentSession } = await supabase.auth.getSession();
    if (currentSession.session?.user) {
      logger.info('[Google] SUCCESS! Found existing session:', {
        id: currentSession.session.user.id,
        email: currentSession.session.user.email,
        totalTime: `${Date.now() - startTime}ms`,
      });
      return {
        success: true,
        user: {
          id: currentSession.session.user.id,
          email: currentSession.session.user.email ?? '',
        },
      };
    }

    logger.error('[Google] Failed to complete authentication - no session found');
    logger.debug('[Google] Total time:', Date.now() - startTime, 'ms');
    return { success: false, error: 'Failed to complete authentication' };
  } catch (error) {
    if (error instanceof Error) {
      logger.error('[Google] Error:', error.message);
      logger.error('[Google] Stack:', error.stack);
      logger.debug('[Google] Total time before error:', Date.now() - startTime, 'ms');
      return { success: false, error: error.message };
    }
    logger.error('[Google] Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get user's display name from social provider metadata
 */
export function getDisplayNameFromProvider(
  providerData: Record<string, unknown> | null
): string | null {
  if (!providerData) return null;
  
  // Try common name fields
  if (typeof providerData.full_name === 'string') {
    return providerData.full_name;
  }
  if (typeof providerData.name === 'string') {
    return providerData.name;
  }
  
  // Try first + last name combination
  const firstName = providerData.given_name ?? providerData.first_name;
  const lastName = providerData.family_name ?? providerData.last_name;
  
  if (typeof firstName === 'string' || typeof lastName === 'string') {
    return [firstName, lastName].filter(Boolean).join(' ') || null;
  }
  
  return null;
}
