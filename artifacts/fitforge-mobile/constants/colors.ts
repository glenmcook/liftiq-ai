/**
 * Design tokens derived from the FitForge web app's cyber-blue-light theme.
 * Matches web: background hsl(210 25% 97%), primary hsl(199 89% 37%)
 */

const colors = {
  light: {
    // Legacy aliases
    text: '#0f1728',
    tint: '#0284c7',

    // Core surfaces
    background: '#f4f8fc',
    foreground: '#0f1728',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#0f1728',
    cardBorder: '#d8e2ec',

    // Primary action color (sky blue - matches web cyber-blue-light)
    primary: '#0284c7',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis surfaces
    secondary: '#e4edf5',
    secondaryForeground: '#0f1728',

    // Muted / subdued elements
    muted: '#e4edf5',
    mutedForeground: '#617080',

    // Accent highlights
    accent: '#dae6f2',
    accentForeground: '#0f1728',

    // Destructive actions
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#d8e2ec',
    input: '#d8e2ec',

    // Ring / focus
    ring: '#0284c7',

    // Chart colors
    chart1: '#0284c7',
    chart2: '#0369a1',
    chart3: '#22c55e',
  },

  // Border radius matching the web app's --radius: 0.5rem (8px)
  radius: 10,
};

export default colors;
