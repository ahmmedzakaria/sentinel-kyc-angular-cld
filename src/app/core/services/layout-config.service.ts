import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { LayoutConfig } from '../models/layout-config.model';

/**
 * Today a static asset; swap this to a real endpoint (e.g. `/api/layout-config`)
 * once a backend serves it post-authentication — everything downstream reads
 * this service's signals/ensureLoaded(), not the URL, so that swap is a
 * one-line change here.
 */
const CONFIG_URL = '/assets/config/layout-config.json';

/**
 * Loads the server-provided layout structure (nav tree, header/status-bar
 * content) and theme configuration (color primaries, size primitives) that
 * used to be hardcoded in nav-tree.model.ts/_tokens.scss/header.component.ts.
 * Fetched once, right after auth succeeds (see authGuard) so AppShellComponent
 * never mounts before this is loaded — see AGENTS.md's "Layout Config"
 * section for the full contract and rationale.
 */
@Injectable({ providedIn: 'root' })
export class LayoutConfigService {
  private readonly http = inject(HttpClient);

  private readonly config = signal<LayoutConfig | null>(null);
  private loadRequest: Observable<LayoutConfig> | null = null;

  readonly loaded = computed(() => this.config() !== null);
  readonly navTree = computed(() => this.config()?.navTree ?? []);
  readonly header = computed(() => this.config()?.header ?? null);
  readonly statusBar = computed(() => this.config()?.statusBar ?? null);
  readonly themes = computed(() => this.config()?.themes ?? null);
  readonly sizes = computed(() => this.config()?.sizes ?? null);

  /**
   * Fetches and caches the config — safe to call from multiple places
   * (the auth guard, a lazily-loaded feature); the request only fires once,
   * subsequent calls reuse the in-flight or already-resolved result.
   */
  ensureLoaded(): Observable<LayoutConfig> {
    const current = this.config();
    if (current) {
      return of(current);
    }
    if (!this.loadRequest) {
      this.loadRequest = this.http.get<LayoutConfig>(CONFIG_URL).pipe(
        tap((config) => this.config.set(config)),
        shareReplay(1)
      );
    }
    return this.loadRequest;
  }

  /** Test-only seam — seeds state synchronously so specs don't need an HTTP round trip. */
  applyConfig(config: LayoutConfig): void {
    this.config.set(config);
  }
}
