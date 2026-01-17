import { useEffect, useState, useCallback } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useUserStore } from '../stores/userStore';
import { onAuthStateChange } from '../services/auth';
import { getSupabaseClient, isDemoMode } from '../services/supabase';
import { initializeDatabase } from '../services/database';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { setUser, setLoading, isAuthenticated, isInitialized, initialize, user } = useUserStore();

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
      SplashScreen.hideAsync();
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
