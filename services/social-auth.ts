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
  const startTime = Date.now();
  console.log('[Apple Auth] Starting Apple Sign-In flow...');
  
  try {
    // Check availability
    console.log('[Apple Auth] Checking availability...');
    const isAvailable = await isAppleSignInAvailable();
    console.log('[Apple Auth] Apple Sign-In available:', isAvailable);
    
    if (!isAvailable) {
      return { 
        success: false, 
        error: Platform.OS === 'ios' 
          ? 'Apple Sign-In is not available on this device' 
          : 'Apple Sign-In is only available on iOS'
      };
    }

    // Generate a random nonce for security
    console.log('[Apple Auth] Generating nonce...');
    const rawNonce = Crypto.getRandomValues(new Uint8Array(32))
      .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
    
    // Hash the nonce using SHA256
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );
    console.log('[Apple Auth] Nonce generated:', Date.now() - startTime, 'ms');

    // Request Apple Sign-In
    console.log('[Apple Auth] Opening Apple Sign-In dialog...');
    const appleStartTime = Date.now();
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    console.log('[Apple Auth] Apple dialog completed:', Date.now() - appleStartTime, 'ms');
    console.log('[Apple Auth] Got credential:', {
      hasIdentityToken: !!credential.identityToken,
      hasEmail: !!credential.email,
      hasFullName: !!credential.fullName,
    });

    // Verify we got an identity token
    if (!credential.identityToken) {
      console.error('[Apple Auth] No identity token received');
      return { success: false, error: 'No identity token received from Apple' };
    }

    // Sign in with Supabase using the Apple credential
    console.log('[Apple Auth] Getting Supabase client...');
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('[Apple Auth] Supabase not configured');
      return { success: false, error: 'Supabase not configured' };
    }
    
    console.log('[Apple Auth] Signing in with Supabase...');
    const supabaseStartTime = Date.now();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce, // Send the raw nonce, not the hashed one
    });
    console.log('[Apple Auth] Supabase sign-in completed:', Date.now() - supabaseStartTime, 'ms');

    if (error) {
      console.error('[Apple Auth] Supabase error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      console.error('[Apple Auth] No user data returned');
      return { success: false, error: 'No user data returned' };
    }

    console.log('[Apple Auth] SUCCESS! User authenticated:', {
      id: data.user.id,
      email: data.user.email,
      totalTime: Date.now() - startTime, 'ms',
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
        console.log('[Apple Auth] User cancelled');
        return { success: false, error: 'cancelled' };
      }
      console.error('[Apple Auth] Error:', error.message);
      console.error('[Apple Auth] Stack:', error.stack);
      console.log('[Apple Auth] Total time before error:', Date.now() - startTime, 'ms');
      return { success: false, error: error.message };
    }
    console.error('[Apple Auth] Unexpected error:', error);
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
  console.log('[Google Auth] Starting Google Sign-In flow...');
  
  try {
    console.log('[Google Auth] Getting Supabase client...');
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('[Google Auth] Supabase not configured');
      return { success: false, error: 'Supabase not configured' };
    }
    console.log('[Google Auth] Supabase client ready:', Date.now() - startTime, 'ms');

    // For Expo Go, we need to use a scheme-based redirect
    // The redirect URL must be configured in Supabase Dashboard under:
    // Authentication > URL Configuration > Redirect URLs
    const redirectTo = 'nutritrack://auth/callback';
    console.log('[Google Auth] Redirect URL:', redirectTo);

    // Start the OAuth flow using Supabase
    // Supabase handles the Google OAuth complexity and redirects
    console.log('[Google Auth] Requesting OAuth URL from Supabase...');
    const oauthStartTime = Date.now();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // We'll handle the browser ourselves
        scopes: 'openid email profile', // Explicitly request email scope
      },
    });
    console.log('[Google Auth] OAuth URL request completed:', Date.now() - oauthStartTime, 'ms');

    if (error) {
      console.error('[Google Auth] Supabase OAuth error:', error);
      return { success: false, error: error.message };
    }

    if (!data.url) {
      console.error('[Google Auth] No OAuth URL returned');
      return { success: false, error: 'No OAuth URL returned' };
    }
    console.log('[Google Auth] Got OAuth URL, opening browser...');

    // Open the OAuth URL in a web browser
    // Use the custom scheme for the return URL
    console.log('[Google Auth] Opening auth session in browser...');
    const browserStartTime = Date.now();
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
      {
        showInRecents: true,
      }
    );
    console.log('[Google Auth] Browser session completed:', Date.now() - browserStartTime, 'ms');
    console.log('[Google Auth] Browser result type:', result.type);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      console.log('[Google Auth] User cancelled the auth flow');
      return { success: false, error: 'cancelled' };
    }

    if (result.type !== 'success') {
      console.error('[Google Auth] Authentication failed:', result.type);
      return { success: false, error: `Authentication failed: ${result.type}` };
    }

    // Extract the URL parameters from the redirect
    const url = result.url;
    console.log('[Google Auth] Parsing callback URL...');
    
    // Parse the URL to get the auth tokens
    // Supabase returns tokens in the URL fragment or query params
    const parsedUrl = new URL(url);
    const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
    const queryParams = parsedUrl.searchParams;
    
    // Get access token and refresh token from URL
    const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') ?? queryParams.get('refresh_token');
    
    console.log('[Google Auth] Tokens found in URL:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    if (accessToken && refreshToken) {
      // Set the session manually with the tokens from the URL
      console.log('[Google Auth] Setting session with tokens...');
      const sessionStartTime = Date.now();
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      console.log('[Google Auth] Session set completed:', Date.now() - sessionStartTime, 'ms');

      if (sessionError) {
        console.error('[Google Auth] Session error:', sessionError);
        return { success: false, error: sessionError.message };
      }

      if (sessionData.user) {
        console.log('[Google Auth] SUCCESS! User authenticated:', {
          id: sessionData.user.id,
          email: sessionData.user.email,
          totalTime: Date.now() - startTime, 'ms',
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
    console.log('[Google Auth] No tokens in URL, checking existing session...');
    const { data: currentSession } = await supabase.auth.getSession();
    if (currentSession.session?.user) {
      console.log('[Google Auth] SUCCESS! Found existing session:', {
        id: currentSession.session.user.id,
        email: currentSession.session.user.email,
        totalTime: Date.now() - startTime, 'ms',
      });
      return {
        success: true,
        user: {
          id: currentSession.session.user.id,
          email: currentSession.session.user.email ?? '',
        },
      };
    }

    console.error('[Google Auth] Failed to complete authentication - no session found');
    console.log('[Google Auth] Total time:', Date.now() - startTime, 'ms');
    return { success: false, error: 'Failed to complete authentication' };
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Google Auth] Error:', error.message);
      console.error('[Google Auth] Stack:', error.stack);
      console.log('[Google Auth] Total time before error:', Date.now() - startTime, 'ms');
      return { success: false, error: error.message };
    }
    console.error('[Google Auth] Unexpected error:', error);
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
