import { SizeConfig, ThemeConfigEntry } from '../models/layout-config.model';

/**
 * Runtime TypeScript port of the color-mixing functions in
 * src/styles/_tokens.scss (soft-tone/muted-tone/border-tone/surface-tone/
 * deepen-tone/on-color) plus the size-scale calc()s next to them. SCSS
 * computes those at *build* time, once, for the 7 themes baked into the
 * stylesheet; this module recomputes the same formulas at *runtime* from
 * whatever primaries/sizes LayoutConfigService loads, so a theme that never
 * existed in the compiled CSS (a future API-provided one) still derives all
 * the same shades correctly. Keep the formulas here byte-for-byte in sync
 * with _tokens.scss's — if one changes, change both.
 */

// Never varies per theme in this app — same reasoning as _tokens.scss's $shadow-tint.
const SHADOW_TINT: [number, number, number] = [0x12, 0x18, 0x21]; // #121821

function parseColor(value: string): [number, number, number] {
  const hex = value.trim().replace(/^#/, '');
  if (hex.length === 3) {
    const [r, g, b] = hex.split('');
    return [parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16)];
  }
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function toRgbString([r, g, b]: [number, number, number]): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function toRgbaString([r, g, b]: [number, number, number], alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Sass's color.mix($c1, $c2, $weight): $weight% of $c1 blended with the rest of $c2 (opaque colors only). */
function mix(c1: string | [number, number, number], c2: string | [number, number, number], weightPercent: number): [number, number, number] {
  const [r1, g1, b1] = typeof c1 === 'string' ? parseColor(c1) : c1;
  const [r2, g2, b2] = typeof c2 === 'string' ? parseColor(c2) : c2;
  const w = weightPercent / 100;
  const blend = (a: number, b: number) => Math.round(a * w + b * (1 - w));
  return [blend(r1, r2), blend(g1, g2), blend(b1, b2)];
}

/** A low-emphasis tinted background for a status/brand color, e.g. --accent-soft. */
function softTone(hue: string, card: string): string {
  return toRgbString(mix(hue, card, 12));
}

/** A muted text/icon tone — $weight of $text mixed into $paper. */
function mutedTone(text: string, paper: string, weight = 60): string {
  return toRgbString(mix(text, paper, weight));
}

/** A border/divider shade — a light touch of $text mixed into $paper. */
function borderTone(text: string, paper: string, weight = 10): string {
  return toRgbString(mix(text, paper, weight));
}

/** The "raised surface" step between the page background and the card surface. */
function surfaceTone(paper: string, card: string): string {
  return toRgbString(mix(paper, card, 50));
}

/** Mixes toward black rather than toward $text — see _tokens.scss's deepen-tone() for why. */
function deepenTone(paper: string, weight: number): string {
  return toRgbString(mix([0, 0, 0], paper, weight));
}

/**
 * The correct foreground to draw ON TOP OF a saturated background, picked by
 * perceived brightness (ITU-R BT.601 luma) rather than assumed to always be
 * white — see _tokens.scss's on-color() for the Navy-gold rationale.
 */
function onColor(bg: string): [number, number, number] {
  const [r, g, b] = parseColor(bg);
  const luma = (r * 299 + g * 587 + b * 114) / 1000;
  return luma > 150 ? SHADOW_TINT : [255, 255, 255];
}

/**
 * Every custom property _tokens.scss computes per-theme from a handful of
 * primaries, recomputed here from `theme.primaries` — plus `chromeOverrides`
 * substituted in afterward for the handful of bespoke literals (Navy) that
 * don't fit the standard light-base/dark-base derivation.
 */
export function computeThemeTokens(theme: ThemeConfigEntry): Record<string, string> {
  const { text, paper, card, accent, amber, red, success, info } = theme.primaries;
  const isDark = theme.base === 'dark';
  const overrides = theme.chromeOverrides ?? {};

  const onAccent = onColor(accent);
  const accentSoft = overrides.accentSoft ?? softTone(accent, card);

  const tokens: Record<string, string> = {
    '--ink': toRgbString(SHADOW_TINT),
    '--text': text,
    '--text-muted': mutedTone(text, paper),
    '--paper': paper,
    '--card': card,
    '--surface-2': surfaceTone(paper, card),
    '--border': borderTone(text, paper),

    '--accent': accent,
    '--accent-soft': accentSoft,
    '--on-accent': toRgbString(onAccent),
    '--on-accent-soft': toRgbaString(onAccent, 0.14),
    '--on-accent-strong': toRgbaString(onAccent, 0.72),
    '--amber': amber,
    '--amber-soft': softTone(amber, card),
    '--red': red,
    '--red-soft': softTone(red, card),
    '--on-red': toRgbString(onColor(red)),
    '--success': success,
    '--success-soft': softTone(success, card),
    '--info': info,
    '--info-soft': softTone(info, card),
    '--focus': info,

    '--shadow': `0 calc(var(--space-unit) * 2) calc(var(--space-unit) * 6) ${toRgbaString(SHADOW_TINT, 0.14)}`,
    '--shadow-sm': `0 calc(var(--space-unit) * 0.5) calc(var(--space-unit) * 1) ${toRgbaString(SHADOW_TINT, 0.14)}`,
    '--overlay-backdrop': 'rgba(0, 0, 0, 0.4)',

    '--chrome-bg': overrides.bg ?? (isDark ? toRgbString(SHADOW_TINT) : card),
    '--chrome-border': overrides.border ?? borderTone(text, paper, isDark ? 13 : 10),
    '--chrome-border-strong': overrides.borderStrong ?? (isDark ? deepenTone(paper, 22) : borderTone(text, paper, 16)),
    '--chrome-text': isDark ? '#ffffff' : text,
    '--chrome-text-muted': mutedTone(text, paper, 45),
    '--chrome-icon': isDark ? mutedTone(text, paper, 87) : mutedTone(text, paper),
    '--chrome-hover-bg': overrides.hoverBg ?? borderTone(text, paper, isDark ? 9 : 5),
    '--chrome-active-bg': overrides.activeBg ?? (isDark ? (overrides.hoverBg ?? borderTone(text, paper, 9)) : accentSoft),
    '--chrome-search-bg': overrides.searchBg ?? (isDark ? borderTone(text, paper, 8) : paper),
    '--chrome-search-border': overrides.searchBorder ?? borderTone(text, paper, isDark ? 16 : 10),
    '--chrome-search-text': overrides.searchText ?? (isDark ? '#ffffff' : text),
    '--chrome-search-placeholder': overrides.searchPlaceholder ?? mutedTone(text, paper, isDark ? 44 : 40)
  };

  return tokens;
}

/** The size-scale half of _tokens.scss (space/radius/font-size/font-weight steps), all derived from three primitives. */
export function computeSizeTokens(sizes: SizeConfig): Record<string, string> {
  const unit = sizes.spaceUnit;
  const radius = sizes.radiusBase;
  const fontBase = sizes.fontSizeBase;

  const px = (n: number) => `${n}px`;
  const spaceSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 22, 32];

  const tokens: Record<string, string> = {
    '--space-unit': px(unit),
    '--font-weight-normal': '400',
    '--font-weight-medium': '500',
    '--font-weight-semibold': '600',
    '--font-weight-bold': '700',
    '--radius': px(radius),
    '--radius-sm': px(radius * 0.75),
    '--radius-md': px(radius * 1.125),
    '--radius-lg': px(radius * 1.5),
    '--radius-pill': '999px',
    '--font-size-base': px(fontBase),
    '--font-size-3xs': px(fontBase * 0.67),
    '--font-size-2xs': px(fontBase * 0.74),
    '--font-size-xs': px(fontBase * 0.815),
    '--font-size-sm': px(fontBase * 0.89),
    '--font-size-md': px(fontBase * 1.11),
    '--font-size-lg': px(fontBase * 1.33),
    '--font-size-xl': px(fontBase * 1.63),
    '--font-size-2xl': px(fontBase * 1.93),
    '--header-height': px(sizes.headerHeight),
    '--statusbar-height': px(sizes.statusBarHeight),
    '--rail-width-collapsed': px(sizes.railWidthCollapsed),
    '--rail-width-expanded': px(sizes.railWidthExpanded)
  };

  for (const step of spaceSteps) {
    tokens[`--space-${step}`] = px(unit * step);
  }
  tokens['--control-height'] = 'var(--space-19)';
  tokens['--control-height-sm'] = 'var(--space-18)';

  return tokens;
}

/** Sets every computed token as an inline custom property on `target` — inline style outranks any stylesheet rule, so this cleanly overrides the SCSS-compiled defaults once config loads. */
export function applyTokens(tokens: Record<string, string>, target: HTMLElement = document.body): void {
  for (const [name, value] of Object.entries(tokens)) {
    target.style.setProperty(name, value);
  }
}
