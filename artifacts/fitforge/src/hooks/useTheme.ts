import { useState, useCallback } from "react";

export type ThemeId =
  | "neon-green"
  | "cyber-blue"
  | "volcanic"
  | "purple-pulse"
  | "crimson"
  | "arctic"
  | "neon-green-light"
  | "cyber-blue-light"
  | "volcanic-light"
  | "purple-pulse-light"
  | "crimson-light"
  | "arctic-light";

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
  "--chart-2": string;
  "--chart-3": string;
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
  // ── Dark themes ────────────────────────────────────────────────────────────
  {
    id: "neon-green",
    name: "Neon Green",
    label: "Dark",
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
      "--chart-2": "210 100% 60%",
      "--chart-3": "162 75% 55%",
    },
  },
  {
    id: "cyber-blue",
    name: "Cyber Blue",
    label: "Dark",
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
      "--chart-2": "210 100% 60%",
      "--chart-3": "162 75% 55%",
    },
  },
  {
    id: "volcanic",
    name: "Volcanic",
    label: "Dark",
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
      "--chart-2": "210 100% 60%",
      "--chart-3": "162 75% 55%",
    },
  },
  {
    id: "purple-pulse",
    name: "Purple Pulse",
    label: "Dark",
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
      "--chart-2": "210 100% 60%",
      "--chart-3": "162 75% 55%",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    label: "Dark",
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
      "--chart-2": "210 100% 60%",
      "--chart-3": "162 75% 55%",
    },
  },
  {
    id: "arctic",
    name: "Arctic",
    label: "Dark / Indigo",
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
      "--primary": "239 84% 66%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "239 84% 66%",
      "--muted": "210 40% 92%",
      "--muted-foreground": "215 16% 43%",
      "--secondary": "210 40% 92%",
      "--secondary-foreground": "222 47% 11%",
      "--accent": "210 40% 92%",
      "--accent-foreground": "222 47% 11%",
      // sidebar stays dark for contrast
      "--sidebar": "222 47% 11%",
      "--sidebar-foreground": "0 0% 96%",
      "--sidebar-border": "222 35% 18%",
      "--sidebar-primary": "239 84% 66%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-ring": "239 84% 66%",
      "--sidebar-accent": "222 35% 18%",
      "--sidebar-accent-foreground": "0 0% 96%",
      "--chart-1": "239 84% 66%",
      "--chart-2": "210 90% 38%",
      "--chart-3": "162 75% 28%",
    },
  },

  // ── Light themes ───────────────────────────────────────────────────────────
  {
    id: "neon-green-light",
    name: "Neon Green",
    label: "Light",
    primaryHex: "#4ade4a",
    bgHex: "#f4faf4",
    vars: {
      "--background": "111 20% 97%",
      "--foreground": "111 30% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "111 30% 10%",
      "--card-border": "111 20% 88%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "111 30% 10%",
      "--popover-border": "111 20% 88%",
      "--border": "111 20% 88%",
      "--input": "111 20% 88%",
      "--primary": "111 80% 29%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "111 80% 29%",
      "--muted": "111 20% 93%",
      "--muted-foreground": "111 15% 39%",
      "--secondary": "111 20% 93%",
      "--secondary-foreground": "111 30% 10%",
      "--accent": "111 20% 90%",
      "--accent-foreground": "111 30% 10%",
      "--sidebar": "111 20% 96%",
      "--sidebar-foreground": "111 30% 10%",
      "--sidebar-border": "111 20% 88%",
      "--sidebar-primary": "111 80% 29%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-ring": "111 80% 29%",
      "--sidebar-accent": "111 20% 90%",
      "--sidebar-accent-foreground": "111 30% 10%",
      "--chart-1": "111 80% 29%",
      "--chart-2": "210 90% 38%",
      "--chart-3": "162 75% 28%",
    },
  },
  {
    id: "cyber-blue-light",
    name: "Cyber Blue",
    label: "Light",
    primaryHex: "#0ea5e9",
    bgHex: "#f0f8ff",
    vars: {
      "--background": "210 25% 97%",
      "--foreground": "222 47% 11%",
      "--card": "0 0% 100%",
      "--card-foreground": "222 47% 11%",
      "--card-border": "214 25% 88%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "222 47% 11%",
      "--popover-border": "214 25% 88%",
      "--border": "214 25% 88%",
      "--input": "214 25% 88%",
      "--primary": "199 89% 37%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "199 89% 37%",
      "--muted": "210 30% 93%",
      "--muted-foreground": "215 20% 44%",
      "--secondary": "210 30% 93%",
      "--secondary-foreground": "222 47% 11%",
      "--accent": "210 30% 90%",
      "--accent-foreground": "222 47% 11%",
      "--sidebar": "210 25% 96%",
      "--sidebar-foreground": "222 47% 11%",
      "--sidebar-border": "214 25% 88%",
      "--sidebar-primary": "199 89% 37%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-ring": "199 89% 37%",
      "--sidebar-accent": "210 30% 90%",
      "--sidebar-accent-foreground": "222 47% 11%",
      "--chart-1": "199 89% 37%",
      "--chart-2": "210 90% 38%",
      "--chart-3": "162 75% 28%",
    },
  },
  {
    id: "volcanic-light",
    name: "Volcanic",
    label: "Light",
    primaryHex: "#f59e0b",
    bgHex: "#fefaf0",
    vars: {
      "--background": "38 30% 97%",
      "--foreground": "30 40% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "30 40% 10%",
      "--card-border": "38 25% 88%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "30 40% 10%",
      "--popover-border": "38 25% 88%",
      "--border": "38 25% 88%",
      "--input": "38 25% 88%",
      "--primary": "38 92% 50%",
      "--primary-foreground": "30 60% 5%",
      "--ring": "38 92% 50%",
      "--muted": "38 25% 93%",
      "--muted-foreground": "30 20% 41%",
      "--secondary": "38 25% 93%",
      "--secondary-foreground": "30 40% 10%",
      "--accent": "38 25% 90%",
      "--accent-foreground": "30 40% 10%",
      "--sidebar": "38 30% 96%",
      "--sidebar-foreground": "30 40% 10%",
      "--sidebar-border": "38 25% 88%",
      "--sidebar-primary": "38 92% 50%",
      "--sidebar-primary-foreground": "30 60% 5%",
      "--sidebar-ring": "38 92% 50%",
      "--sidebar-accent": "38 25% 90%",
      "--sidebar-accent-foreground": "30 40% 10%",
      "--chart-1": "38 92% 42%",
      "--chart-2": "210 90% 38%",
      "--chart-3": "162 75% 28%",
    },
  },
  {
    id: "purple-pulse-light",
    name: "Purple Pulse",
    label: "Light",
    primaryHex: "#a855f7",
    bgHex: "#faf5ff",
    vars: {
      "--background": "270 20% 97%",
      "--foreground": "270 40% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "270 40% 10%",
      "--card-border": "270 20% 88%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "270 40% 10%",
      "--popover-border": "270 20% 88%",
      "--border": "270 20% 88%",
      "--input": "270 20% 88%",
      "--primary": "271 91% 58%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "271 91% 58%",
      "--muted": "270 20% 93%",
      "--muted-foreground": "270 15% 45%",
      "--secondary": "270 20% 93%",
      "--secondary-foreground": "270 40% 10%",
      "--accent": "270 20% 90%",
      "--accent-foreground": "270 40% 10%",
      "--sidebar": "270 20% 96%",
      "--sidebar-foreground": "270 40% 10%",
      "--sidebar-border": "270 20% 88%",
      "--sidebar-primary": "271 91% 58%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-ring": "271 91% 58%",
      "--sidebar-accent": "270 20% 90%",
      "--sidebar-accent-foreground": "270 40% 10%",
      "--chart-1": "271 91% 58%",
      "--chart-2": "210 90% 38%",
      "--chart-3": "162 75% 28%",
    },
  },
  {
    id: "crimson-light",
    name: "Crimson",
    label: "Light",
    primaryHex: "#ef4444",
    bgHex: "#fff5f5",
    vars: {
      "--background": "0 20% 97%",
      "--foreground": "0 30% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "0 30% 10%",
      "--card-border": "0 20% 88%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "0 30% 10%",
      "--popover-border": "0 20% 88%",
      "--border": "0 20% 88%",
      "--input": "0 20% 88%",
      "--primary": "0 84% 50%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "0 84% 50%",
      "--muted": "0 15% 93%",
      "--muted-foreground": "0 10% 44%",
      "--secondary": "0 15% 93%",
      "--secondary-foreground": "0 30% 10%",
      "--accent": "0 15% 90%",
      "--accent-foreground": "0 30% 10%",
      "--sidebar": "0 20% 96%",
      "--sidebar-foreground": "0 30% 10%",
      "--sidebar-border": "0 20% 88%",
      "--sidebar-primary": "0 84% 50%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-ring": "0 84% 50%",
      "--sidebar-accent": "0 15% 90%",
      "--sidebar-accent-foreground": "0 30% 10%",
      "--chart-1": "0 84% 50%",
      "--chart-2": "210 90% 38%",
      "--chart-3": "162 75% 28%",
    },
  },
  {
    id: "arctic-light",
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
      "--primary": "239 84% 66%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "239 84% 66%",
      "--muted": "210 40% 92%",
      "--muted-foreground": "215 16% 43%",
      "--secondary": "210 40% 92%",
      "--secondary-foreground": "222 47% 11%",
      "--accent": "210 40% 92%",
      "--accent-foreground": "222 47% 11%",
      "--sidebar": "210 20% 96%",
      "--sidebar-foreground": "222 47% 11%",
      "--sidebar-border": "214 32% 88%",
      "--sidebar-primary": "239 84% 66%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-ring": "239 84% 66%",
      "--sidebar-accent": "210 40% 92%",
      "--sidebar-accent-foreground": "222 47% 11%",
      "--chart-1": "239 84% 66%",
      "--chart-2": "210 90% 38%",
      "--chart-3": "162 75% 28%",
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
