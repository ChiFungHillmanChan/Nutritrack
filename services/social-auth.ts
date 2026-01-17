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
  try {
    // Check availability
    const isAvailable = await isAppleSignInAvailable();
    if (!isAvailable) {
      return { 
        success: false, 
        error: Platform.OS === 'ios' 
          ? 'Apple Sign-In is not available on this device' 
          : 'Apple Sign-In is only available on iOS'
      };
    }

    // Generate a random nonce for security
    const rawNonce = Crypto.getRandomValues(new Uint8Array(32))
      .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
    
    // Hash the nonce using SHA256
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );

    // Request Apple Sign-In
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    // Verify we got an identity token
    if (!credential.identityToken) {
      return { success: false, error: 'No identity token received from Apple' };
    }

    // Sign in with Supabase using the Apple credential
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce, // Send the raw nonce, not the hashed one
    });

    if (error) {
      console.error('Supabase Apple Sign-In error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'No user data returned' };
    }

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
        return { success: false, error: 'cancelled' };
      }
      console.error('Apple Sign-In error:', error);
      return { success: false, error: error.message };
    }
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
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    // For Expo Go, we need to use a scheme-based redirect
    // The redirect URL must be configured in Supabase Dashboard under:
    // Authentication > URL Configuration > Redirect URLs
    const redirectTo = 'nutritrack://auth/callback';

    console.log('[Google Sign-In] Starting OAuth flow with redirect:', redirectTo);

    // Start the OAuth flow using Supabase
    // Supabase handles the Google OAuth complexity and redirects
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // We'll handle the browser ourselves
      },
    });

    if (error) {
      console.error('[Google Sign-In] Supabase OAuth error:', error);
      return { success: false, error: error.message };
    }

    if (!data.url) {
      console.error('[Google Sign-In] No OAuth URL returned');
      return { success: false, error: 'No OAuth URL returned' };
    }

    console.log('[Google Sign-In] Opening browser for authentication...');

    // Open the OAuth URL in a web browser
    // Use the custom scheme for the return URL
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
      {
        showInRecents: true,
      }
    );

    console.log('[Google Sign-In] Browser result type:', result.type);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { success: false, error: 'cancelled' };
    }

    if (result.type !== 'success') {
      return { success: false, error: `Authentication failed: ${result.type}` };
    }

    // Extract the URL parameters from the redirect
    const url = result.url;
    console.log('[Google Sign-In] Callback URL received:', url);
    
    // Parse the URL to get the auth tokens
    // Supabase returns tokens in the URL fragment or query params
    const parsedUrl = new URL(url);
    const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
    const queryParams = parsedUrl.searchParams;
    
    // Get access token and refresh token from URL
    const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') ?? queryParams.get('refresh_token');

    console.log('[Google Sign-In] Tokens found:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken 
    });

    if (accessToken && refreshToken) {
      console.log('[Google Sign-In] Setting session with tokens...');
      // Set the session manually with the tokens from the URL
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('[Google Sign-In] Session error:', sessionError);
        return { success: false, error: sessionError.message };
      }

      if (sessionData.user) {
        console.log('[Google Sign-In] Session set successfully for user:', sessionData.user.id);
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
    // Add a small delay and retry logic
    console.log('[Google Sign-In] No tokens in URL, checking for existing session...');
    
    // Wait a moment for Supabase to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: currentSession, error: sessionCheckError } = await supabase.auth.getSession();
    
    if (sessionCheckError) {
      console.error('[Google Sign-In] Session check error:', sessionCheckError);
      return { success: false, error: sessionCheckError.message };
    }
    
    if (currentSession.session?.user) {
      console.log('[Google Sign-In] Found existing session for user:', currentSession.session.user.id);
      return {
        success: true,
        user: {
          id: currentSession.session.user.id,
          email: currentSession.session.user.email ?? '',
        },
      };
    }

    console.error('[Google Sign-In] No session found after authentication');
    return { success: false, error: 'Failed to complete authentication. Please try again.' };
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Google Sign-In] Error:', error);
      return { success: false, error: error.message };
    }
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
