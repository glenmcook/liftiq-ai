# Theming

LiftIQ AI supports six accent colour themes on the web app. The theme is persisted across sessions and applied before first paint to prevent a flash of the wrong colour.

---

## Accent colours

| Key | Colour | CSS class applied to `<html>` |
|---|---|---|
| `green` (default) | #22c55e | *(none — default CSS variables)* |
| `blue` | #3b82f6 | `theme-blue` |
| `purple` | #a855f7 | `theme-purple` |
| `orange` | #f97316 | `theme-orange` |
| `red` | #ef4444 | `theme-red` |
| `yellow` | #eab308 | `theme-yellow` |

---

## How it works

### Storage
The selected theme key is stored in `localStorage` under the key `liftiq-theme`.

### Flash prevention
`artifacts/fitforge/index.html` contains a blocking inline `<script>` that:
1. Reads `localStorage.getItem('liftiq-theme')`
2. Applies the corresponding class to `<html>` synchronously

Because this script runs before any CSS or React code, the correct theme is applied before the browser paints — no flash.

### CSS variables
Each theme class overrides the `--primary` and related CSS custom properties defined in `artifacts/fitforge/src/index.css`. Components use `var(--primary)` (mapped to Tailwind `text-primary`, `bg-primary`, etc.) — they never reference hex values directly.

### Settings UI
`artifacts/fitforge/src/pages/settings.tsx` renders a row of six colour swatches. Clicking a swatch:
1. Writes the new key to `localStorage`
2. Removes any existing theme class from `<html>`
3. Adds the new theme class to `<html>`

The change is instant and persistent.

---

## Adding a new theme

1. Choose a key name (e.g. `pink`) and a primary hex colour
2. Add a CSS class `.theme-pink` in `artifacts/fitforge/src/index.css` that overrides the colour custom properties
3. Add the key to the `THEMES` constant in `settings.tsx` and to the flash-prevention script in `index.html`
4. Update the table above in this document

> **Important:** the flash-prevention script in `index.html` must be updated in lockstep with `THEMES` in `settings.tsx`. If a theme is available in Settings but not in the script, users who pick that theme will see a flash on their next page load. See task #14 for automated enforcement.

---

## Mobile theming

The mobile app uses `useColors()` from `artifacts/fitforge-mobile/hooks/useColors.ts` which returns a static set of colour tokens. It does not currently support accent colour switching; this is tracked as a proposed feature (Task #10).
