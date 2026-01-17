import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import { onAuthStateChange } from '../services/auth';
import { initializeDatabase } from '../services/database';
import { getSupabaseClient, isDemoMode } from '../services/supabase';
import { getDisplayNameFromProvider } from '../services/social-auth';
import { useUserStore } from '../stores/userStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
// Wrap in try-catch to handle cases where splash screen is not available (e.g., Expo Go reload)
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen might not be available, which is fine
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { setUser, setLoading, setOAuthMetadata, isAuthenticated, isInitialized, initialize, user } = useUserStore();
  const splashHiddenRef = useRef(false);

  const initializeApp = useCallback(async () => {
    try {
      setLoading(true);

      // Initialize SQLite database first
      await initializeDatabase();

      // Initialize user store from SQLite
      initialize();

    } catch (error) {
      console.error('[App] Initialization error:', error);
    } finally {
      setLoading(false);
      setIsReady(true);
      // Only hide splash screen once to avoid the error
      if (!splashHiddenRef.current) {
        splashHiddenRef.current = true;
        SplashScreen.hideAsync().catch(() => {
          // Splash screen might not be available, which is fine
        });
      }
    }
  }, [setLoading, initialize]);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Handle navigation after initialization
  useEffect(() => {
    if (!isReady || !isInitialized) return;

    // If user is authenticated from SQLite
    if (isAuthenticated && user) {
      setTimeout(() => {
        // Check if onboarding is completed
        if (user.onboarding_completed === false) {
          // Redirect to onboarding if not completed
          router.replace('/(auth)/onboarding');
        } else {
          // Navigate to main app
          router.replace('/(tabs)');
        }
      }, 100);
    }
  }, [isReady, isInitialized, isAuthenticated, user]);

  // Handle deep link URLs for OAuth callback
  useEffect(() => {
    // Demo mode - skip URL handling
    if (isDemoMode()) {
      return;
    }

    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('[App] Deep link received:', url);
      
      // Check if this is an auth callback
      if (url.includes('auth/callback') || url.includes('access_token')) {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        
        try {
          // Parse tokens from URL
          const parsedUrl = new URL(url);
          const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
          const queryParams = parsedUrl.searchParams;
          
          const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') ?? queryParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('[App] Setting session from deep link...');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('[App] Error setting session from deep link:', error);
            } else if (data.user) {
              console.log('[App] Session set from deep link for user:', data.user.id);
            }
          }
        } catch (error) {
          console.error('[App] Error handling deep link:', error);
        }
      }
    };

    // Handle initial URL (when app is opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for URL events (when app is already open)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // Listen for Supabase auth changes (when not in demo mode)
  useEffect(() => {
    // Demo mode - skip auth state listener
    if (isDemoMode()) {
      return;
    }

    // Listen to auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      console.log('[App] Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setOAuthMetadata(null);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        const typedSession = session as { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } };
        
        // Extract OAuth metadata from user_metadata (Google/Apple provide this)
        const userMetadata = typedSession.user.user_metadata;
        if (userMetadata) {
          const displayName = getDisplayNameFromProvider(userMetadata);
          const avatarUrl = typeof userMetadata.avatar_url === 'string' ? userMetadata.avatar_url : 
                           typeof userMetadata.picture === 'string' ? userMetadata.picture : undefined;
          
          console.log('[App] OAuth metadata extracted:', { 
            name: displayName, 
            email: typedSession.user.email,
            hasAvatar: !!avatarUrl 
          });
          
          setOAuthMetadata({
            name: displayName ?? undefined,
            email: typedSession.user.email,
            avatar_url: avatarUrl,
          });
        }
        
        // Fetch user profile
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', typedSession.user.id)
            .single();

          if (profile) {
            setUser(profile);
            // Navigate to main app if onboarding is complete
            if (profile.onboarding_completed) {
              router.replace('/(tabs)');
            } else {
              router.replace('/(auth)/onboarding');
            }
          } else {
            // User exists in auth but not in users table yet
            // This is normal for new OAuth users - they need to complete onboarding
            console.log('[App] No profile found for user, redirecting to onboarding');
            router.replace('/(auth)/onboarding');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setOAuthMetadata]);

  if (!isReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
