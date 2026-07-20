import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { Stack } from 'expo-router';
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
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Set the base URL for the API client — Expo bundles need absolute URLs
// since they run outside the web proxy.
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
setBaseUrl(BASE_URL);

const AUTH_TOKEN_KEY = "@fitforge/auth_token";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
    </Stack>
  );
}

function PushSetup() {
  usePushNotifications();
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

  // Check for stored auth token on startup
  useEffect(() => {
    AsyncStorage.getItem(AUTH_TOKEN_KEY).then((storedToken) => {
      if (storedToken) {
        // Wire the token into the API client
        setAuthTokenGetter(() => storedToken);
        setAuthenticated(true);
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
              <PushSetup />
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
