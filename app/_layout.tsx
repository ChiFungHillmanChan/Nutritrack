import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import { onAuthStateChange } from '../services/auth';
import { initializeDatabase } from '../services/database';
import { getSupabaseClient, isDemoMode } from '../services/supabase';
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
  const { setUser, setLoading, isAuthenticated, isInitialized, initialize, user } = useUserStore();
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
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' && session) {
        // Fetch user profile
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', (session as { user: { id: string } }).user.id)
            .single();

          if (profile) {
            setUser(profile);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

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
