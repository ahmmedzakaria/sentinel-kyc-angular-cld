import { NavNode } from './nav-tree.model';
import { ThemeId } from './theme.model';

/** The 8 hue/neutral primaries every derived token in color-math.ts computes from. */
export interface ThemeColorPrimaries {
  text: string;
  paper: string;
  card: string;
  accent: string;
  amber: string;
  red: string;
  success: string;
  info: string;
}

/**
 * Bespoke chrome-* literals for a theme whose header/rail/status-bar surfaces
 * don't fit the standard light-base/dark-base derivation formula (Navy's
 * distinct blue-black chrome family, not a tint of its card color) — see
 * computeThemeTokens() in color-math.ts for how these override the computed
 * defaults field-by-field.
 */
export interface ThemeChromeOverrides {
  accentSoft?: string;
  bg?: string;
  border?: string;
  borderStrong?: string;
  hoverBg?: string;
  activeBg?: string;
  searchBg?: string;
  searchBorder?: string;
  searchText?: string;
  searchPlaceholder?: string;
}

export interface ThemeConfigEntry {
  id: ThemeId;
  label: string;
  base: 'light' | 'dark';
  /** Accent swatch shown in the theme picker; 'sun'/'moon' use an icon instead of a color chip. */
  swatch: string | 'sun' | 'moon';
  primaries: ThemeColorPrimaries;
  chromeOverrides?: ThemeChromeOverrides;
}

/** Size primitives + fixed chrome dimensions — see computeSizeTokens() in color-math.ts. */
export interface SizeConfig {
  spaceUnit: number;
  radiusBase: number;
  fontSizeBase: number;
  headerHeight: number;
  statusBarHeight: number;
}

export interface HeaderAppTile {
  name: string;
  icon: string;
}

export interface HeaderLanguage {
  code: string;
  label: string;
}

export interface HeaderConfig {
  searchTypes: string[];
  apps: HeaderAppTile[];
  tenants: string[];
  languages: HeaderLanguage[];
}

export interface StatusBarConfig {
  systemStatusLabel: string;
  envLabel: string;
  version: string;
}

/** The full payload LayoutConfigService loads — see AGENTS.md's "Layout Config" section. */
export interface LayoutConfig {
  navTree: NavNode[];
  header: HeaderConfig;
  statusBar: StatusBarConfig;
  themes: ThemeConfigEntry[];
  sizes: SizeConfig;
}
