import { Injectable, computed, inject, signal } from '@angular/core';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NavNode } from '../models/nav-tree.model';
import { NavTreeStateService } from './nav-tree-state.service';
import { DEFAULT_MODULE_GROUP_NOTE, MODULE_GROUP_NOTES } from '../models/mega-panel-notes.model';

export interface MegaPanelContent {
  path: number[];
  title: string;
  note: string;
  groupIcon: string;
  featureGroups: NavNode[];
}

@Injectable({ providedIn: 'root' })
export class MegaPanelService {
  private readonly tree = inject(NavTreeStateService);

  readonly origin = signal<CdkOverlayOrigin | null>(null);
  private readonly openPath = signal<number[] | null>(null);

  readonly content = computed<MegaPanelContent | null>(() => {
    const path = this.openPath();
    if (!path) {
      return null;
    }
    return this.buildContent(path);
  });

  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  /** `path` must point at a level-3 Category node (Operation/Setup/Report). */
  open(path: number[], origin: CdkOverlayOrigin): void {
    clearTimeout(this.closeTimer);
    this.origin.set(origin);
    this.openPath.set(path);
  }

  scheduleClose(delayMs = 220): void {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.openPath.set(null), delayMs);
  }

  cancelClose(): void {
    clearTimeout(this.closeTimer);
  }

  close(): void {
    clearTimeout(this.closeTimer);
    this.openPath.set(null);
  }

  private buildContent(path: number[]): MegaPanelContent | null {
    const moduleGroup = this.tree.getNode(path.slice(0, 1));
    const module = this.tree.getNode(path.slice(0, 2));
    const category = this.tree.getNode(path);
    if (!category) {
      return null;
    }
    const groupLabel = moduleGroup?.label ?? '';
    return {
      path,
      title: `${module ? module.label : groupLabel} · ${category.label}`,
      note: MODULE_GROUP_NOTES[groupLabel] ?? DEFAULT_MODULE_GROUP_NOTE,
      groupIcon: moduleGroup?.icon ?? '',
      featureGroups: category.children ?? []
    };
  }
}
