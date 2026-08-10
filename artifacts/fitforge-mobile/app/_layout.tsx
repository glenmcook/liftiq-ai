import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { router, Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setBaseUrl, setAuthTokenGetter, ApiError, useGetProfile } from '@workspace/api-client-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Set the base URL for the API client — Expo bundles need absolute URLs
// since they run outside the web proxy.
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
setBaseUrl(BASE_URL);

const AUTH_TOKEN_KEY = "@fitforge/auth_token";

// ─── Auth context ─────────────────────────────────────────────────────────────
// Exposes logout() to screens nested under RootLayoutNav (e.g. Settings).

const AuthContext = createContext<{ logout: () => void }>({ logout: () => {} });
export function useAuth() {
  return useContext(AuthContext);
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// ─── Mobile Login Screen ─────────────────────────────────────────────────────

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      if (data.token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        onLogin(data.token);
      }
    } catch {
      setError('Network error — check your connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleWhite}>LIFT</Text>
        <Text style={styles.titleGreen}>IQ AI</Text>
      </Text>
      <Text style={styles.subtitle}>PERSONAL TRAINING SYSTEM</Text>

      <View style={styles.form}>
        <Text style={styles.label}>ACCESS CODE</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#555"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity
          style={[styles.button, (!password || loading) && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!password || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>ENTER SYSTEM</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
  },
  titleWhite: { color: '#fff' },
  titleGreen: { color: '#22c55e' },
  subtitle: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 4,
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 48,
  },
  form: { width: '100%', gap: 12 },
  label: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  error: { color: '#ef4444', fontSize: 13, fontFamily: 'monospace' },
  button: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 14,
  },
});

// ─── Main Layout ─────────────────────────────────────────────────────────────

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="library" options={{ title: 'Library' }} />
      <Stack.Screen name="dexa" options={{ title: 'DEXA Scans' }} />
      <Stack.Screen name="diet" options={{ title: 'Diet' }} />
      <Stack.Screen name="checkin" options={{ title: 'AI Check-in' }} />
      <Stack.Screen name="recommendations" options={{ title: 'Arsenal' }} />
      <Stack.Screen
        name="calibrate"
        options={{ title: 'Calibrate', presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
}

function PushSetup() {
  usePushNotifications();
  return null;
}

// Redirects to the first-run interview when no profile exists yet. Renders
// nothing itself — sits alongside RootLayoutNav so the Stack (and therefore
// navigation) is already mounted when the redirect fires.
function ProfileGate() {
  const pathname = usePathname();
  // This is a one-time gate check, not a live-reactive query — without
  // disabling the refetch triggers, react-query re-runs it on window focus /
  // reconnect / remount, and each 404 (expected the whole time the user is
  // still filling out Calibrate) re-fires the effect below. Combined with
  // router.replace() to the route the user is already on, that was resetting
  // the wizard back to step 1 mid-fill — reported as "keeps cycling".
  const { isLoading, error } = useGetProfile(
    {},
    {
      query: {
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
      },
    }
  );

  useEffect(() => {
    if (pathname === '/calibrate') return;
    if (!isLoading && error instanceof ApiError && error.status === 404) {
      router.replace('/calibrate');
    }
  }, [isLoading, error, pathname]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthTokenGetter(null);
    setAuthenticated(false);
  };

  // Bounce back to the login screen on any 401 — the server's token store
  // is in-memory (see tokenStore.ts), so it's wiped on every deploy/restart.
  // A token that was valid on disk otherwise looks fine to the app forever,
  // producing generic "could not load X" errors on every screen instead of
  // a clear re-login prompt.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof ApiError && error.status === 401) logout();
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error instanceof ApiError && error.status === 401) logout();
          },
        }),
      })
  );

  // Check for a stored auth token on startup, and confirm the server still
  // considers it valid (a server restart invalidates all issued tokens —
  // see tokenStore.ts) before trusting it and skipping the login screen.
  useEffect(() => {
    AsyncStorage.getItem(AUTH_TOKEN_KEY).then(async (storedToken) => {
      if (storedToken) {
        try {
          const res = await fetch(`${BASE_URL}/api/auth/check`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await res.json();
          if (data.authenticated) {
            setAuthTokenGetter(() => storedToken);
            setAuthenticated(true);
          } else {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
          }
        } catch {
          // Network error while validating — fall back to trusting the
          // stored token rather than forcing a login the user can't
          // complete offline. The global 401 handler above still catches
          // it once a real request goes through.
          setAuthTokenGetter(() => storedToken);
          setAuthenticated(true);
        }
      }
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authChecked]);

  if (!fontsLoaded && !fontError) return null;
  if (!authChecked) return null;

  if (!authenticated) {
    return (
      <LoginScreen
        onLogin={(token) => {
          setAuthTokenGetter(() => token);
          setAuthenticated(true);
        }}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <AuthContext.Provider value={{ logout }}>
                <PushSetup />
                <ProfileGate />
                <RootLayoutNav />
              </AuthContext.Provider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
