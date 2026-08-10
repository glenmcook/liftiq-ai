import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themes, { THEME_META, type ThemeId } from '@/constants/colors';

const STORAGE_KEY = '@fitforge/theme';
const DEFAULT_DARK: ThemeId = 'cyber-blue';
const DEFAULT_LIGHT: ThemeId = 'cyber-blue-light';

let currentThemeId: ThemeId | null = null;
let listeners: Array<(id: ThemeId | null) => void> = [];

async function loadStoredTheme() {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  currentThemeId = (stored as ThemeId) ?? null;
  listeners.forEach((l) => l(currentThemeId));
}
loadStoredTheme();

/**
 * Returns the design tokens for the active theme, plus setTheme/themeId for
 * building a picker UI. When no theme has been explicitly chosen, follows
 * the device's system light/dark appearance (Cyber Blue in both cases,
 * matching the app's original default).
 */
export function useColors() {
  const scheme = useColorScheme();
  const [themeId, setThemeIdState] = useState<ThemeId | null>(currentThemeId);

  useEffect(() => {
    const listener = (id: ThemeId | null) => setThemeIdState(id);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const setTheme = useCallback((id: ThemeId | null) => {
    currentThemeId = id;
    listeners.forEach((l) => l(id));
    if (id) AsyncStorage.setItem(STORAGE_KEY, id);
    else AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const activeId = themeId ?? (scheme === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT);
  const palette = themes[activeId] ?? themes[DEFAULT_LIGHT];

  return { ...palette, radius: 10, themeId: activeId, isSystemTheme: themeId === null, setTheme, themes: THEME_META };
}
