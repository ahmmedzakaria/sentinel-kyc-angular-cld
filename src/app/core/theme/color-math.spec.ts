import { describe, expect, it } from 'vitest';
import { computeSizeTokens, computeThemeTokens } from './color-math';
import { ThemeConfigEntry } from '../models/layout-config.model';
import { SizeConfig } from '../models/layout-config.model';

const LIGHT: ThemeConfigEntry = {
  id: 'light',
  label: 'Light',
  base: 'light',
  swatch: 'sun',
  primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#1f6f5c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
};

const NAVY: ThemeConfigEntry = {
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
};

const SIZES: SizeConfig = { spaceUnit: 2, radiusBase: 8, fontSizeBase: 13.5, headerHeight: 58, statusBarHeight: 28 };

describe('computeThemeTokens', () => {
  it('picks white foreground for Light’s darker accent hue', () => {
    const tokens = computeThemeTokens(LIGHT);
    expect(tokens['--on-accent']).toBe('rgb(255, 255, 255)');
  });

  it('picks the dark ink foreground for Navy’s lighter gold accent, not white', () => {
    // Navy's #c99a3b reads as "light" by perceived brightness (luma > 150) —
    // this is the specific case that motivated on-color() over hardcoding white.
    const tokens = computeThemeTokens(NAVY);
    expect(tokens['--on-accent']).toBe('rgb(18, 24, 33)');
    expect(tokens['--on-accent']).not.toBe('rgb(255, 255, 255)');
  });

  it('substitutes chromeOverrides literals as-is instead of the computed formula', () => {
    const tokens = computeThemeTokens(NAVY);
    expect(tokens['--accent-soft']).toBe('#2e2510');
    expect(tokens['--chrome-bg']).toBe('#0b1a33');
    expect(tokens['--chrome-search-placeholder']).toBe('#7488a8');
  });

  it('derives dark-base chrome tokens from the formula when no override is given', () => {
    const dark: ThemeConfigEntry = {
      id: 'dark',
      label: 'Dark',
      base: 'dark',
      swatch: 'moon',
      primaries: { text: '#e7ebef', paper: '#0d1218', card: '#161d26', accent: '#1f6f5c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
    };
    const tokens = computeThemeTokens(dark);
    expect(tokens['--chrome-bg']).toBe('rgb(18, 24, 33)'); // --ink, since dark has no bg override
    expect(tokens['--chrome-text']).toBe('#ffffff');
  });

  it('light-base chrome-active-bg aliases --accent-soft', () => {
    const tokens = computeThemeTokens(LIGHT);
    expect(tokens['--chrome-active-bg']).toBe(tokens['--accent-soft']);
  });
});

describe('computeSizeTokens', () => {
  it('derives the full 2px-unit space scale from spaceUnit', () => {
    const tokens = computeSizeTokens(SIZES);
    expect(tokens['--space-1']).toBe('2px');
    expect(tokens['--space-19']).toBe('38px');
    expect(tokens['--space-32']).toBe('64px');
    expect(tokens['--control-height']).toBe('var(--space-19)');
  });

  it('derives radius/font-size steps from radiusBase/fontSizeBase', () => {
    const tokens = computeSizeTokens(SIZES);
    expect(tokens['--radius']).toBe('8px');
    expect(tokens['--radius-md']).toBe('9px');
    expect(tokens['--font-size-base']).toBe('13.5px');
  });

  it('carries header/status-bar fixed heights through', () => {
    const tokens = computeSizeTokens(SIZES);
    expect(tokens['--header-height']).toBe('58px');
    expect(tokens['--statusbar-height']).toBe('28px');
  });
});
