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
export async function signInWithApple(): Promise<SocialAuthResult> {
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
    
    // Extract name from Apple credential (only available on first sign-in)
    let userName: string | undefined;
    if (credential.fullName) {
      const nameParts = [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean);
      if (nameParts.length > 0) {
        userName = nameParts.join(' ');
      }
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

    // Build user metadata from Apple credential and Supabase user_metadata
    const userMetadata: SocialUserMetadata = {
      ...(userName && { name: userName }),
      // Also check Supabase user_metadata for name if not from credential
      ...(!userName && data.user.user_metadata && extractUserMetadata(data.user.user_metadata as Record<string, unknown>)),
    };

    logger.info('[Apple] SUCCESS! User authenticated:', {
      id: data.user.id,
      email: data.user.email,
      hasName: !!userMetadata.name,
      totalTime: `${Date.now() - startTime}ms`,
    });
    
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
      },
      userMetadata,
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
export async function signInWithGoogle(): Promise<SocialAuthResult> {
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
    // Supabase returns tokens in the URL fragment (hash) after the #
    // Format: nutritrack://auth/callback#access_token=xxx&refresh_token=xxx&expires_in=3600&token_type=bearer
    const parsedUrl = new URL(url);
    
    // Manual parsing of hash params to handle edge cases
    // URLSearchParams may have issues with certain characters
    const hashString = parsedUrl.hash.substring(1); // Remove the leading #
    
    // Parse hash parameters manually to ensure we get the full values
    const hashParamsMap: Record<string, string> = {};
    if (hashString) {
      const pairs = hashString.split('&');
      for (const pair of pairs) {
        const [key, ...valueParts] = pair.split('=');
        // Rejoin with = in case the value contains = characters
        const value = valueParts.join('=');
        if (key && value) {
          // URL decode the value
          hashParamsMap[key] = decodeURIComponent(value);
        }
      }
    }
    
    const queryParams = parsedUrl.searchParams;
    
    // Get access token and refresh token from URL
    const accessToken = hashParamsMap['access_token'] ?? queryParams.get('access_token');
    const refreshToken = hashParamsMap['refresh_token'] ?? queryParams.get('refresh_token');
    
    logger.debug('[Google] Tokens found in URL:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    if (accessToken && refreshToken) {
      // WORKAROUND: Supabase's setSession and getSession hang on iOS
      // Parse the JWT access token directly to extract user info
      logger.debug('[Google] Extracting user from JWT token directly...');
      const sessionStartTime = Date.now();
      
      try {
        // Parse the JWT token to extract user info
        // JWT format: header.payload.signature (base64 encoded)
        const tokenParts = accessToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT token format');
        }
        
        // Decode the payload (middle part)
        const payloadBase64 = tokenParts[1];
        // Handle base64url encoding (replace - with + and _ with /)
        const payloadBase64Standard = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = atob(payloadBase64Standard);
        const payload = JSON.parse(payloadJson);
        
        // Extract user info from the JWT payload
        const userId = payload.sub;
        const userEmail = payload.email;
        
        if (!userId) {
          throw new Error('No user ID found in token');
        }
        
        // Store the session directly in SecureStore for persistence
        // This bypasses Supabase's hanging setSession
        const sessionData = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: payload.exp,
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: userId,
            email: userEmail,
            app_metadata: payload.app_metadata,
            user_metadata: payload.user_metadata,
            aud: payload.aud,
            role: payload.role,
          },
        };
        
        // Get the storage key that Supabase uses
        const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
        const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase/)?.[1] ?? 'unknown';
        const storageKey = `sb-${projectRef}-auth-token`;
        
        // Store directly using SecureStore
        const sessionString = JSON.stringify(sessionData);
        
        // Import SecureStore directly for this operation
        const SecureStore = await import('expo-secure-store');
        
        // Chunk the session data if needed (SecureStore has 2048 byte limit)
        const CHUNK_SIZE = 1800;
        if (sessionString.length <= CHUNK_SIZE) {
          await SecureStore.setItemAsync(storageKey, sessionString, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED,
          });
        } else {
          // Clear any existing data first
          await SecureStore.deleteItemAsync(storageKey);
          const chunkCountStr = await SecureStore.getItemAsync(`${storageKey}_chunks`);
          if (chunkCountStr) {
            const oldChunkCount = parseInt(chunkCountStr, 10);
            for (let i = 0; i < oldChunkCount; i++) {
              await SecureStore.deleteItemAsync(`${storageKey}_${i}`);
            }
            await SecureStore.deleteItemAsync(`${storageKey}_chunks`);
          }
          
          // Chunk and store
          const chunks: string[] = [];
          for (let i = 0; i < sessionString.length; i += CHUNK_SIZE) {
            chunks.push(sessionString.slice(i, i + CHUNK_SIZE));
          }
          
          await SecureStore.setItemAsync(`${storageKey}_chunks`, chunks.length.toString(), {
            keychainAccessible: SecureStore.WHEN_UNLOCKED,
          });
          
          for (let i = 0; i < chunks.length; i++) {
            await SecureStore.setItemAsync(`${storageKey}_${i}`, chunks[i], {
              keychainAccessible: SecureStore.WHEN_UNLOCKED,
            });
          }
        }
        
        // Extract user metadata from JWT payload
        const userMetadata = extractUserMetadata(payload.user_metadata as Record<string, unknown> ?? {});
        
        logger.info('[Google] SUCCESS! User authenticated via direct JWT parsing:', {
          id: userId,
          email: userEmail,
          hasName: !!userMetadata.name,
          totalTime: `${Date.now() - sessionStartTime}ms`,
        });
        
        return {
          success: true,
          user: {
            id: userId,
            email: userEmail ?? '',
          },
          userMetadata,
        };
      } catch (jwtError) {
        const errorMessage = jwtError instanceof Error ? jwtError.message : String(jwtError);
        logger.error('[Google] JWT parsing failed:', errorMessage);
        return { success: false, error: `Authentication failed: ${errorMessage}` };
      }
    }

    // If no tokens in URL, check if session was set automatically
    logger.debug('[Google] No tokens in URL, checking existing session...');
    const { data: currentSession } = await supabase.auth.getSession();
    if (currentSession.session?.user) {
      const userMetadata = extractUserMetadata(
        currentSession.session.user.user_metadata as Record<string, unknown> ?? {}
      );
      logger.info('[Google] SUCCESS! Found existing session:', {
        id: currentSession.session.user.id,
        email: currentSession.session.user.email,
        hasName: !!userMetadata.name,
        totalTime: `${Date.now() - startTime}ms`,
      });
      return {
        success: true,
        user: {
          id: currentSession.session.user.id,
          email: currentSession.session.user.email ?? '',
        },
        userMetadata,
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
 * User metadata from social providers
 * Contains profile information like name and avatar
 */
export interface SocialUserMetadata {
  name?: string;
  picture?: string;
  // Note: Google and Apple do NOT provide date_of_birth or gender
}

/**
 * Result from social authentication
 */
export interface SocialAuthResult {
  success: boolean;
  error?: string;
  user?: { id: string; email: string };
  userMetadata?: SocialUserMetadata;
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

/**
 * Extract user metadata from social provider payload
 */
export function extractUserMetadata(
  providerData: Record<string, unknown> | null
): SocialUserMetadata {
  if (!providerData) return {};
  
  const name = getDisplayNameFromProvider(providerData);
  const picture = typeof providerData.picture === 'string' 
    ? providerData.picture 
    : typeof providerData.avatar_url === 'string'
      ? providerData.avatar_url
      : undefined;
  
  return {
    ...(name && { name }),
    ...(picture && { picture }),
  };
}
