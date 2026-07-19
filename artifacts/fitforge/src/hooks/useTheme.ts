import { useState, useCallback } from "react";

export type ThemeId =
  | "neon-green"
  | "cyber-blue"
  | "volcanic"
  | "purple-pulse"
  | "crimson"
  | "arctic";

interface ThemeVars {
  // backgrounds
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--card-border": string;
  "--popover": string;
  "--popover-foreground": string;
  "--popover-border": string;
  "--border": string;
  "--input": string;
  // accent
  "--primary": string;
  "--primary-foreground": string;
  "--ring": string;
  // muted / secondary
  "--muted": string;
  "--muted-foreground": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--accent": string;
  "--accent-foreground": string;
  // sidebar
  "--sidebar": string;
  "--sidebar-foreground": string;
  "--sidebar-border": string;
  "--sidebar-primary": string;
  "--sidebar-primary-foreground": string;
  "--sidebar-ring": string;
  "--sidebar-accent": string;
  "--sidebar-accent-foreground": string;
  // chart-1 matches accent
  "--chart-1": string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  label: string;
  /** Hex for the swatch preview */
  primaryHex: string;
  bgHex: string;
  vars: ThemeVars;
}

// ─── Theme definitions ────────────────────────────────────────────────────────

export const THEMES: ThemeDefinition[] = [
  {
    id: "neon-green",
    name: "Neon Green",
    label: "Default",
    primaryHex: "#4ade4a",
    bgHex: "#0a0a0a",
    vars: {
      "--background": "0 0% 4%",
      "--foreground": "0 0% 98%",
      "--card": "0 0% 7%",
      "--card-foreground": "0 0% 98%",
      "--card-border": "0 0% 12%",
      "--popover": "0 0% 7%",
      "--popover-foreground": "0 0% 98%",
      "--popover-border": "0 0% 15%",
      "--border": "0 0% 15%",
      "--input": "0 0% 15%",
      "--primary": "111 80% 50%",
      "--primary-foreground": "0 0% 5%",
      "--ring": "111 80% 50%",
      "--muted": "0 0% 12%",
      "--muted-foreground": "0 0% 60%",
      "--secondary": "0 0% 12%",
      "--secondary-foreground": "0 0% 98%",
      "--accent": "0 0% 15%",
      "--accent-foreground": "0 0% 98%",
      "--sidebar": "0 0% 4%",
      "--sidebar-foreground": "0 0% 98%",
      "--sidebar-border": "0 0% 12%",
      "--sidebar-primary": "111 80% 50%",
      "--sidebar-primary-foreground": "0 0% 5%",
      "--sidebar-ring": "111 80% 50%",
      "--sidebar-accent": "0 0% 12%",
      "--sidebar-accent-foreground": "0 0% 98%",
      "--chart-1": "111 80% 50%",
    },
  },
  {
    id: "cyber-blue",
    name: "Cyber Blue",
    label: "Sky",
    primaryHex: "#0ea5e9",
    bgHex: "#050912",
    vars: {
      "--background": "222 60% 4%",
      "--foreground": "210 40% 98%",
      "--card": "222 50% 7%",
      "--card-foreground": "210 40% 98%",
      "--card-border": "222 40% 12%",
      "--popover": "222 50% 7%",
      "--popover-foreground": "210 40% 98%",
      "--popover-border": "222 40% 15%",
      "--border": "222 40% 15%",
      "--input": "222 40% 15%",
      "--primary": "199 89% 48%",
      "--primary-foreground": "222 60% 5%",
      "--ring": "199 89% 48%",
      "--muted": "222 40% 12%",
      "--muted-foreground": "215 20% 60%",
      "--secondary": "222 40% 12%",
      "--secondary-foreground": "210 40% 98%",
      "--accent": "222 40% 15%",
      "--accent-foreground": "210 40% 98%",
      "--sidebar": "222 60% 4%",
      "--sidebar-foreground": "210 40% 98%",
      "--sidebar-border": "222 40% 12%",
      "--sidebar-primary": "199 89% 48%",
      "--sidebar-primary-foreground": "222 60% 5%",
      "--sidebar-ring": "199 89% 48%",
      "--sidebar-accent": "222 40% 12%",
      "--sidebar-accent-foreground": "210 40% 98%",
      "--chart-1": "199 89% 48%",
    },
  },
  {
    id: "volcanic",
    name: "Volcanic",
    label: "Amber",
    primaryHex: "#f59e0b",
    bgHex: "#0d0900",
    vars: {
      "--background": "30 60% 4%",
      "--foreground": "40 40% 98%",
      "--card": "30 50% 6%",
      "--card-foreground": "40 40% 98%",
      "--card-border": "30 40% 12%",
      "--popover": "30 50% 6%",
      "--popover-foreground": "40 40% 98%",
      "--popover-border": "30 40% 15%",
      "--border": "30 40% 15%",
      "--input": "30 40% 15%",
      "--primary": "38 92% 50%",
      "--primary-foreground": "30 60% 5%",
      "--ring": "38 92% 50%",
      "--muted": "30 40% 12%",
      "--muted-foreground": "30 20% 60%",
      "--secondary": "30 40% 12%",
      "--secondary-foreground": "40 40% 98%",
      "--accent": "30 40% 15%",
      "--accent-foreground": "40 40% 98%",
      "--sidebar": "30 60% 4%",
      "--sidebar-foreground": "40 40% 98%",
      "--sidebar-border": "30 40% 12%",
      "--sidebar-primary": "38 92% 50%",
      "--sidebar-primary-foreground": "30 60% 5%",
      "--sidebar-ring": "38 92% 50%",
      "--sidebar-accent": "30 40% 12%",
      "--sidebar-accent-foreground": "40 40% 98%",
      "--chart-1": "38 92% 50%",
    },
  },
  {
    id: "purple-pulse",
    name: "Purple Pulse",
    label: "Violet",
    primaryHex: "#a855f7",
    bgHex: "#080610",
    vars: {
      "--background": "270 50% 4%",
      "--foreground": "270 30% 98%",
      "--card": "270 45% 7%",
      "--card-foreground": "270 30% 98%",
      "--card-border": "270 35% 12%",
      "--popover": "270 45% 7%",
      "--popover-foreground": "270 30% 98%",
      "--popover-border": "270 35% 15%",
      "--border": "270 35% 15%",
      "--input": "270 35% 15%",
      "--primary": "271 91% 65%",
      "--primary-foreground": "270 50% 5%",
      "--ring": "271 91% 65%",
      "--muted": "270 35% 12%",
      "--muted-foreground": "270 15% 60%",
      "--secondary": "270 35% 12%",
      "--secondary-foreground": "270 30% 98%",
      "--accent": "270 35% 15%",
      "--accent-foreground": "270 30% 98%",
      "--sidebar": "270 50% 4%",
      "--sidebar-foreground": "270 30% 98%",
      "--sidebar-border": "270 35% 12%",
      "--sidebar-primary": "271 91% 65%",
      "--sidebar-primary-foreground": "270 50% 5%",
      "--sidebar-ring": "271 91% 65%",
      "--sidebar-accent": "270 35% 12%",
      "--sidebar-accent-foreground": "270 30% 98%",
      "--chart-1": "271 91% 65%",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    label: "Red Steel",
    primaryHex: "#ef4444",
    bgHex: "#0d0505",
    vars: {
      "--background": "0 60% 4%",
      "--foreground": "0 20% 98%",
      "--card": "0 50% 6%",
      "--card-foreground": "0 20% 98%",
      "--card-border": "0 40% 12%",
      "--popover": "0 50% 6%",
      "--popover-foreground": "0 20% 98%",
      "--popover-border": "0 40% 15%",
      "--border": "0 40% 15%",
      "--input": "0 40% 15%",
      "--primary": "0 84% 60%",
      "--primary-foreground": "0 60% 5%",
      "--ring": "0 84% 60%",
      "--muted": "0 40% 12%",
      "--muted-foreground": "0 15% 60%",
      "--secondary": "0 40% 12%",
      "--secondary-foreground": "0 20% 98%",
      "--accent": "0 40% 15%",
      "--accent-foreground": "0 20% 98%",
      "--sidebar": "0 60% 4%",
      "--sidebar-foreground": "0 20% 98%",
      "--sidebar-border": "0 40% 12%",
      "--sidebar-primary": "0 84% 60%",
      "--sidebar-primary-foreground": "0 60% 5%",
      "--sidebar-ring": "0 84% 60%",
      "--sidebar-accent": "0 40% 12%",
      "--sidebar-accent-foreground": "0 20% 98%",
      "--chart-1": "0 84% 60%",
    },
  },
  {
    id: "arctic",
    name: "Arctic",
    label: "Light / Indigo",
    primaryHex: "#6366f1",
    bgHex: "#f1f5f9",
    vars: {
      "--background": "210 20% 96%",
      "--foreground": "222 47% 11%",
      "--card": "0 0% 100%",
      "--card-foreground": "222 47% 11%",
      "--card-border": "214 32% 88%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "222 47% 11%",
      "--popover-border": "214 32% 88%",
      "--border": "214 32% 88%",
      "--input": "214 32% 88%",
      "--primary": "239 84% 67%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "239 84% 67%",
      "--muted": "210 40% 92%",
      "--muted-foreground": "215 16% 47%",
      "--secondary": "210 40% 92%",
      "--secondary-foreground": "222 47% 11%",
      "--accent": "210 40% 92%",
      "--accent-foreground": "222 47% 11%",
      // sidebar stays dark for contrast
      "--sidebar": "222 47% 11%",
      "--sidebar-foreground": "0 0% 96%",
      "--sidebar-border": "222 35% 18%",
      "--sidebar-primary": "239 84% 67%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-ring": "239 84% 67%",
      "--sidebar-accent": "222 35% 18%",
      "--sidebar-accent-foreground": "0 0% 96%",
      "--chart-1": "239 84% 67%",
    },
  },
];

const STORAGE_KEY = "liftiq-theme";
const DEFAULT_THEME: ThemeId = "neon-green";

// ─── Apply theme to :root ─────────────────────────────────────────────────────

export function applyTheme(id: ThemeId) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  root.setAttribute("data-theme", id);
}

/** Call this synchronously before React renders to avoid a flash. */
export function applyStoredTheme() {
  const stored = (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? DEFAULT_THEME;
  applyTheme(stored);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme() {
  const [themeId, setThemeIdState] = useState<ThemeId>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? DEFAULT_THEME
  );

  const setTheme = useCallback((id: ThemeId) => {
    localStorage.setItem(STORAGE_KEY, id);
    applyTheme(id);
    setThemeIdState(id);
  }, []);

  return {
    themeId,
    setTheme,
    themes: THEMES,
    currentTheme: THEMES.find((t) => t.id === themeId) ?? THEMES[0],
  };
}
