import { Injectable, computed, inject, signal } from '@angular/core';
import { NavNode } from '../models/nav-tree.model';
import { LayoutConfigService } from './layout-config.service';

function pathKey(path: number[]): string {
  return path.join('.');
}

function pathsEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

@Injectable({ providedIn: 'root' })
export class NavTreeStateService {
  private readonly layoutConfig = inject(LayoutConfigService);

  /** Empty until LayoutConfigService's config loads — see AppShellComponent, which the authGuard only lets render once it has. */
  readonly tree = computed<readonly NavNode[]>(() => this.layoutConfig.navTree());

  /** Path of the currently active node (any depth). Empty = Home/Dashboard. */
  readonly activePath = signal<number[]>([]);
  /** Which level-1/level-2 rail rows are expanded inline, keyed by dot-joined path. */
  readonly expandedPaths = signal<Set<string>>(new Set());

  readonly isExpandedToLevel3 = computed(() => {
    const expanded = this.expandedPaths();
    return this.tree().every((group, groupIndex) => {
      const groupPath = [groupIndex];
      if (!expanded.has(pathKey(groupPath))) {
        return false;
      }
      return (group.children ?? []).every((_, moduleIndex) => expanded.has(pathKey(groupPath.concat(moduleIndex))));
    });
  });

  getNode(path: number[]): NavNode | undefined {
    let list: NavNode[] = this.tree() as NavNode[];
    let node: NavNode | undefined;
    for (const index of path) {
      node = list[index];
      list = node?.children ?? [];
    }
    return node;
  }

  getChildren(path: number[]): NavNode[] {
    if (!path.length) {
      return this.tree() as NavNode[];
    }
    return this.getNode(path)?.children ?? [];
  }

  isExpanded(path: number[]): boolean {
    return this.expandedPaths().has(pathKey(path));
  }

  /** True if `path` is a prefix of (or equal to) the current active path — used to highlight ancestor rows too. */
  isActive(path: number[]): boolean {
    const active = this.activePath();
    return active.length >= path.length && pathsEqual(active.slice(0, path.length), path);
  }

  toggleExpand(path: number[]): void {
    const key = pathKey(path);
    this.expandedPaths.update((set) => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  setActivePath(path: number[]): void {
    this.activePath.set(path);
  }

  expandToLevel3(): void {
    const next = new Set<string>();
    this.tree().forEach((group, groupIndex) => {
      const groupPath = [groupIndex];
      next.add(pathKey(groupPath));
      (group.children ?? []).forEach((_, moduleIndex) => next.add(pathKey(groupPath.concat(moduleIndex))));
    });
    this.expandedPaths.set(next);
  }

  collapseAll(): void {
    this.expandedPaths.set(new Set());
  }

  toggleExpandAllToLevel3(): void {
    this.isExpandedToLevel3() ? this.collapseAll() : this.expandToLevel3();
  }

  resetToHome(): void {
    this.activePath.set([]);
    this.expandedPaths.set(new Set());
  }
}
