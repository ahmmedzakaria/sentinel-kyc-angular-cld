import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import layoutConfig from '../../../assets/config/layout-config.json';
import { NavTreeStateService } from './nav-tree-state.service';
import { LayoutConfigService } from './layout-config.service';
import { LayoutConfig } from '../models/layout-config.model';

describe('NavTreeStateService', () => {
  let service: NavTreeStateService;

  beforeEach(() => {
    TestBed.inject(LayoutConfigService).applyConfig(layoutConfig as LayoutConfig);
    service = TestBed.inject(NavTreeStateService);
  });

  it('starts collapsed with no active path', () => {
    expect(service.activePath()).toEqual([]);
    expect(service.expandedPaths().size).toBe(0);
    expect(service.isExpandedToLevel3()).toBe(false);
  });

  it('getNode()/getChildren() walk the tree by index path', () => {
    const banking = service.getNode([0]);
    expect(banking?.label).toBe('Banking');
    expect(service.getChildren([0])[0].label).toBe('Core Banking');
  });

  it('toggleExpand() opens then closes the same path', () => {
    service.toggleExpand([0]);
    expect(service.isExpanded([0])).toBe(true);
    service.toggleExpand([0]);
    expect(service.isExpanded([0])).toBe(false);
  });

  it('isActive() matches the active path itself and any of its ancestors', () => {
    service.setActivePath([0, 0, 0]);
    expect(service.isActive([0])).toBe(true);
    expect(service.isActive([0, 0])).toBe(true);
    expect(service.isActive([0, 0, 0])).toBe(true);
    expect(service.isActive([1])).toBe(false);
  });

  it('expandToLevel3() expands every group and module, collapseAll() clears it', () => {
    service.expandToLevel3();
    expect(service.isExpandedToLevel3()).toBe(true);
    service.collapseAll();
    expect(service.expandedPaths().size).toBe(0);
    expect(service.isExpandedToLevel3()).toBe(false);
  });

  it('resetToHome() clears both active path and expanded state', () => {
    service.setActivePath([0, 0, 0]);
    service.expandToLevel3();
    service.resetToHome();
    expect(service.activePath()).toEqual([]);
    expect(service.expandedPaths().size).toBe(0);
  });

  it('tree() is empty before config loads', () => {
    TestBed.resetTestingModule();
    const unloaded = TestBed.inject(NavTreeStateService);
    expect(unloaded.tree()).toEqual([]);
  });
});
