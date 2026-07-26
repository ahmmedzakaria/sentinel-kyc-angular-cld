import { Injectable, computed, inject, signal } from '@angular/core';
import { QuickNavItem, QuickNavService } from './quick-nav.service';

const STORAGE_KEY = 'sentinel-kyc.favorite.navigation';

/**
 * Favorited navigation shortcuts — a set of QuickNavItem path keys persisted
 * to localStorage, ported from the source POC's favoritePaths/toggleFavorite().
 */
@Injectable({ providedIn: 'root' })
export class FavoriteNavService {
  private readonly quickNav = inject(QuickNavService);

  private readonly pathKeys = signal<Set<string>>(this.readInitial());

  readonly favorites = computed<QuickNavItem[]>(() =>
    Array.from(this.pathKeys())
      .map((key) => this.quickNav.getByPathKey(key))
      .filter((item): item is QuickNavItem => !!item)
  );

  readonly count = computed(() => this.pathKeys().size);

  isFavorite(pathKey: string): boolean {
    return this.pathKeys().has(pathKey);
  }

  toggle(pathKey: string): void {
    if (!this.quickNav.hasPathKey(pathKey)) {
      return;
    }
    this.pathKeys.update((set) => {
      const next = new Set(set);
      if (next.has(pathKey)) {
        next.delete(pathKey);
      } else {
        next.add(pathKey);
      }
      return next;
    });
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.pathKeys())));
  }

  /** Drops any saved path key that no longer resolves in the current tree — e.g. after a nav-tree content change. */
  private readInitial(): Set<string> {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const keys = Array.isArray(saved) ? saved.filter((key): key is string => typeof key === 'string') : [];
      return new Set(keys.filter((key) => this.quickNav.hasPathKey(key)));
    } catch {
      return new Set();
    }
  }
}
