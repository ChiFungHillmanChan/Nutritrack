import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useUserStore } from '../stores/userStore';
import { onAuthStateChange, getCurrentUser } from '../services/auth';
import { getSupabaseClient, isDemoMode } from '../services/supabase';

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
  const { setUser, setLoading } = useUserStore();

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);

      // Demo mode - skip auth initialization
      if (isDemoMode()) {
        setLoading(false);
        setIsReady(true);
        SplashScreen.hideAsync();
        return;
      }

      // Check for existing session
      const user = await getCurrentUser();

      if (user) {
        // Fetch user profile from database
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            setUser(profile);
          }
        }
      }
    } catch {
      // Silently fail - user will be redirected to login
    } finally {
      setLoading(false);
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
