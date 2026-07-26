import { describe, expect, it } from 'vitest';
import { NavTreeStateService } from './nav-tree-state.service';

describe('NavTreeStateService', () => {
  it('starts collapsed with no active path', () => {
    const service = new NavTreeStateService();
    expect(service.activePath()).toEqual([]);
    expect(service.expandedPaths().size).toBe(0);
    expect(service.isExpandedToLevel3()).toBe(false);
  });

  it('getNode()/getChildren() walk the tree by index path', () => {
    const service = new NavTreeStateService();
    const banking = service.getNode([0]);
    expect(banking?.label).toBe('Banking');
    expect(service.getChildren([0])[0].label).toBe('Core Banking');
  });

  it('toggleExpand() opens then closes the same path', () => {
    const service = new NavTreeStateService();
    service.toggleExpand([0]);
    expect(service.isExpanded([0])).toBe(true);
    service.toggleExpand([0]);
    expect(service.isExpanded([0])).toBe(false);
  });

  it('isActive() matches the active path itself and any of its ancestors', () => {
    const service = new NavTreeStateService();
    service.setActivePath([0, 0, 0]);
    expect(service.isActive([0])).toBe(true);
    expect(service.isActive([0, 0])).toBe(true);
    expect(service.isActive([0, 0, 0])).toBe(true);
    expect(service.isActive([1])).toBe(false);
  });

  it('expandToLevel3() expands every group and module, collapseAll() clears it', () => {
    const service = new NavTreeStateService();
    service.expandToLevel3();
    expect(service.isExpandedToLevel3()).toBe(true);
    service.collapseAll();
    expect(service.expandedPaths().size).toBe(0);
    expect(service.isExpandedToLevel3()).toBe(false);
  });

  it('resetToHome() clears both active path and expanded state', () => {
    const service = new NavTreeStateService();
    service.setActivePath([0, 0, 0]);
    service.expandToLevel3();
    service.resetToHome();
    expect(service.activePath()).toEqual([]);
    expect(service.expandedPaths().size).toBe(0);
  });
});
