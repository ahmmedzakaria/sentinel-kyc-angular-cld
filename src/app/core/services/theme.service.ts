import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DEFAULT_SIZES, DEFAULT_THEMES, ThemeDef, ThemeId } from '../models/theme.model';
import { LayoutConfigService } from './layout-config.service';
import { applyTokens, computeSizeTokens, computeThemeTokens } from '../theme/color-math';

const STORAGE_KEY = 'sentinel-kyc.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly layoutConfig = inject(LayoutConfigService);

  /** Falls back to the built-in defaults until LayoutConfigService's config loads — e.g. the login/register pages, which render outside authGuard. */
  readonly themes = computed<ThemeDef[]>(() => (this.layoutConfig.themes() as ThemeDef[] | null) ?? DEFAULT_THEMES);

  /** Local UI state — a signal, per scope (no RxJS needed for synchronous state like this). */
  private readonly themeId = signal<ThemeId>(this.readInitialTheme());

  readonly current = computed<ThemeDef>(() => this.themes().find((t) => t.id === this.themeId()) ?? this.themes()[0]);

  constructor() {
    // Reflect the active theme onto <body> as a data attribute + structural class
    // (same data-theme/.dark mechanism the compiled SCSS in _tokens.scss keys off
    // of), then compute and apply every color/size custom property from the
    // loaded config on top — inline style outranks the stylesheet, so this cleanly
    // overrides the SCSS-compiled defaults once LayoutConfigService's config loads
    // post-auth without needing to rip out the SCSS system (which still renders
    // correctly pre-load, e.g. on the login page).
    effect(() => {
      const theme = this.current();
      const sizes = this.layoutConfig.sizes() ?? DEFAULT_SIZES;
      const body = document.body;
      body.dataset['theme'] = theme.id;
      body.classList.toggle('dark', theme.base === 'dark');
      localStorage.setItem(STORAGE_KEY, theme.id);
      applyTokens(computeThemeTokens(theme));
      applyTokens(computeSizeTokens(sizes));
    });
  }

  select(id: ThemeId): void {
    this.themeId.set(id);
  }

  private readInitialTheme(): ThemeId {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    return saved && DEFAULT_THEMES.some((t) => t.id === saved) ? saved : 'light';
  }
}
