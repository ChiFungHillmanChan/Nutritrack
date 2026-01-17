/**
 * Social Authentication Service
 * 
 * Handles Apple Sign-In and Google Sign-In for the Nutritrack app.
 * Integrates with Supabase Auth for user management.
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { getSupabaseClient } from './supabase';

// Google OAuth configuration
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * Get the appropriate Google Client ID based on platform
 */
function getGoogleClientId(): string | undefined {
  if (Platform.OS === 'ios') {
    return GOOGLE_CLIENT_ID_IOS;
  }
  if (Platform.OS === 'android') {
    return GOOGLE_CLIENT_ID_ANDROID;
  }
  return GOOGLE_CLIENT_ID_WEB;
}

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
 * Check if Google Sign-In is configured
 */
export function isGoogleSignInAvailable(): boolean {
  return !!getGoogleClientId();
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
 * Uses expo-auth-session for OAuth flow with Google.
 * Works on both iOS and Android.
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
  user?: { id: string; email: string };
}> {
  try {
    const clientId = getGoogleClientId();
    
    if (!clientId) {
      return { 
        success: false, 
        error: 'Google Sign-In is not configured. Please set the GOOGLE_CLIENT_ID environment variable.' 
      };
    }

    // Create the OAuth redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'nutritrack',
      path: 'auth/callback',
    });

    // Create the auth request
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      usePKCE: true,
    });

    // Start the auth session
    const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { success: false, error: 'cancelled' };
      }
      return { success: false, error: `Authentication failed: ${result.type}` };
    }

    // Extract the ID token from the response
    const idToken = result.params?.id_token;
    
    if (!idToken) {
      return { success: false, error: 'No ID token received from Google' };
    }

    // Sign in with Supabase using the Google ID token
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      console.error('Supabase Google Sign-In error:', error);
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
    if (error instanceof Error) {
      console.error('Google Sign-In error:', error);
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
