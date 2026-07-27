import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { NavTreeStateService } from '../../core/services/nav-tree-state.service';
import { QuickNavService } from '../../core/services/quick-nav.service';
import { FavoriteNavService } from '../../core/services/favorite-nav.service';
import { LayoutConfigService } from '../../core/services/layout-config.service';

/** Fallback status-bar content, used before LayoutConfigService's config has loaded — 1:1 copy of layout-config.json's `statusBar`. */
const DEFAULT_STATUS_BAR = { systemStatusLabel: 'System Operational', envLabel: 'Production', version: 'v2.4.1' };

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBarComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly tree = inject(NavTreeStateService);
  private readonly quickNav = inject(QuickNavService);
  private readonly layoutConfig = inject(LayoutConfigService);
  protected readonly favoriteNav = inject(FavoriteNavService);

  protected readonly statusBar = computed(() => this.layoutConfig.statusBar() ?? DEFAULT_STATUS_BAR);

  protected readonly clock = signal(this.formatTime());

  /** Only a full 5-level feature path resolves to a quick-nav item — mirrors the source POC's currentFeaturePathKey. */
  protected readonly currentItem = computed(() => {
    const path = this.tree.activePath();
    return path.length === 5 ? this.quickNav.getByPathKey(path.join('.')) : undefined;
  });

  constructor() {
    const id = setInterval(() => this.clock.set(this.formatTime()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  toggleFavorite(): void {
    const item = this.currentItem();
    if (item) {
      this.favoriteNav.toggle(item.pathKey);
    }
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
