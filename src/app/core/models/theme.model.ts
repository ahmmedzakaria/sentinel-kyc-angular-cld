import { ThemeConfigEntry } from './layout-config.model';

export type ThemeId = 'light' | 'dark' | 'blue' | 'navy' | 'green' | 'purple' | 'gray';

/** A theme is a ThemeConfigEntry with its id narrowed to this app's known set. */
export type ThemeDef = ThemeConfigEntry & { id: ThemeId };

/**
 * Fallback theme list used before LayoutConfigService's config has loaded —
 * e.g. the login/register pages, which render outside authGuard and so never
 * trigger the config load. Kept in sync with (and a 1:1 copy of) the `themes`
 * array in src/assets/config/layout-config.json / scripts/generate-layout-config.mjs;
 * once config loads, ThemeService switches over to the server-provided list.
 */
export const DEFAULT_THEMES: ThemeDef[] = [
  {
    id: 'light',
    label: 'Light',
    base: 'light',
    swatch: 'sun',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#1f6f5c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'dark',
    label: 'Dark',
    base: 'dark',
    swatch: 'moon',
    primaries: { text: '#e7ebef', paper: '#0d1218', card: '#161d26', accent: '#1f6f5c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'blue',
    label: 'Blue Enterprise',
    base: 'light',
    swatch: '#2c5aa0',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#2c5aa0', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'green',
    label: 'Green Compliance',
    base: 'light',
    swatch: '#1c7a4c',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#1c7a4c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'purple',
    label: 'Purple Corporate',
    base: 'light',
    swatch: '#6b3fa0',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#6b3fa0', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'gray',
    label: 'Gray Professional',
    base: 'light',
    swatch: '#3f4a54',
    primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#3f4a54', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
  },
  {
    id: 'navy',
    label: 'Navy Banking',
    base: 'dark',
    swatch: '#0b1a33',
    primaries: { text: '#e9edf3', paper: '#0b1420', card: '#101d30', accent: '#c99a3b', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' },
    chromeOverrides: {
      accentSoft: '#2e2510',
      bg: '#0b1a33',
      border: '#1c2f4d',
      borderStrong: '#081527',
      hoverBg: '#142848',
      activeBg: '#142848',
      searchBg: '#0f2140',
      searchBorder: '#1c2f4d',
      searchText: '#ffffff',
      searchPlaceholder: '#7488a8'
    }
  }
];

/** Fallback size primitives — 1:1 copy of layout-config.json's `sizes`, same reasoning as DEFAULT_THEMES. */
export const DEFAULT_SIZES = { spaceUnit: 2, radiusBase: 8, fontSizeBase: 13.5, headerHeight: 58, statusBarHeight: 28 };
