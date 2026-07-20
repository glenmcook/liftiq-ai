import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

// Configure how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Hook: call once in the root layout ──────────────────────────────────────
export function usePushNotifications() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      registerForPushNotifications();
    }
  }, []);
}

// ─── Registration ─────────────────────────────────────────────────────────────
async function registerForPushNotifications() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  // Expo push tokens require a project ID
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId;

  if (!projectId) {
    console.warn('[Push] No EAS projectId found — push token registration skipped');
    return;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await fetch(`${BASE_URL}/api/push/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.warn('[Push] Token registration failed:', err);
  }
}

// ─── Helpers: schedule local notifications ────────────────────────────────────

/** Fire an immediate local notification celebrating a PR. */
export async function notifyPersonalRecord(exerciseName: string, weightLbs: number) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏆 New Personal Record!',
        body: `${exerciseName} — ${weightLbs} lbs. Your strongest set ever.`,
        sound: true,
      },
      trigger: null, // fire immediately
    });
  } catch (err) {
    console.warn('[Push] PR notification failed:', err);
  }
}
