import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';

import { IconComponent } from '../../shared/icon/icon.component';
import { MegaPanelComponent } from '../mega-panel/mega-panel.component';
import { NavNode, categoryIcon, moduleIcon } from '../../core/models/nav-tree.model';
import { RailStateService } from '../../core/services/rail-state.service';
import { NavTreeStateService } from '../../core/services/nav-tree-state.service';
import { MegaPanelService } from '../../core/services/mega-panel.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { ViewportService } from '../../core/services/viewport.service';

interface RailRow {
  path: number[];
  level: 1 | 2 | 3;
  node: NavNode;
}

@Component({
  selector: 'app-rail-nav',
  standalone: true,
  imports: [IconComponent, OverlayModule, MegaPanelComponent],
  templateUrl: './rail-nav.component.html',
  styleUrl: './rail-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RailNavComponent {
  protected readonly rail = inject(RailStateService);
  protected readonly treeState = inject(NavTreeStateService);
  protected readonly megaPanel = inject(MegaPanelService);
  protected readonly viewport = inject(ViewportService);
  private readonly breadcrumb = inject(BreadcrumbService);
  private readonly router = inject(Router);

  protected readonly moduleIcon = moduleIcon;
  protected readonly categoryIcon = categoryIcon;

  /**
   * Flattens the currently-visible tree rows (levels 1-3) into a single list,
   * mirroring the source POC's imperative renderRail() row-building loop.
   * Levels 2/3 are only included at all when the rail is expanded — matching
   * the original, which never renders them into the DOM in icon view, not
   * just CSS-hides them.
   */
  protected readonly visibleRows = computed<RailRow[]>(() => {
    const detail = this.rail.expanded();
    this.treeState.expandedPaths(); // register as a dependency
    const rows: RailRow[] = [];

    this.treeState.tree.forEach((group, groupIndex) => {
      const groupPath = [groupIndex];
      rows.push({ path: groupPath, level: 1, node: group });

      if (!detail || !this.treeState.isExpanded(groupPath)) {
        return;
      }
      (group.children ?? []).forEach((mod, moduleIndex) => {
        const modulePath = groupPath.concat(moduleIndex);
        rows.push({ path: modulePath, level: 2, node: mod });

        if (!this.treeState.isExpanded(modulePath)) {
          return;
        }
        (mod.children ?? []).forEach((cat, categoryIndex) => {
          rows.push({ path: modulePath.concat(categoryIndex), level: 3, node: cat });
        });
      });
    });

    return rows;
  });

  goHome(): void {
    this.treeState.resetToHome();
    this.megaPanel.close();
    this.breadcrumb.reset('Dashboard');
    this.router.navigateByUrl('/dashboard');
  }

  isHomeActive(): boolean {
    return this.treeState.activePath().length === 0;
  }

  toggleWidth(): void {
    this.rail.toggle();
    this.megaPanel.close();
  }

  toggleExpandAll(): void {
    this.rail.expand();
    this.treeState.toggleExpandAllToLevel3();
    this.treeState.setActivePath([]);
    this.megaPanel.close();
  }

  onRowClick(row: RailRow): void {
    this.treeState.setActivePath(row.path);
    if (row.level < 3) {
      this.rail.expand();
      this.treeState.toggleExpand(row.path);
      this.megaPanel.close();
    }
  }

  onCategoryHover(row: RailRow, origin: CdkOverlayOrigin): void {
    this.megaPanel.open(row.path, origin);
  }

  onCategoryClick(row: RailRow, origin: CdkOverlayOrigin): void {
    this.treeState.setActivePath(row.path);
    this.megaPanel.open(row.path, origin);
  }
}
