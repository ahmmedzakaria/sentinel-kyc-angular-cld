import { describe, expect, it } from 'vitest';
import { NAVIGATION_TREE, categoryIcon, moduleIcon } from './nav-tree.model';

describe('NAVIGATION_TREE', () => {
  it('every module orders its categories as Operation, Setup, Report', () => {
    for (const group of NAVIGATION_TREE) {
      for (const mod of group.children ?? []) {
        const labels = (mod.children ?? []).map((c) => c.label);
        expect(labels).toEqual(['Operation', 'Setup', 'Report']);
      }
    }
  });

  it('has 9 top-level module groups, each with an icon and at least one module', () => {
    expect(NAVIGATION_TREE.length).toBe(9);
    for (const group of NAVIGATION_TREE) {
      expect(group.icon).toBeTruthy();
      expect((group.children ?? []).length).toBeGreaterThan(0);
    }
  });

  it('wires the Customer Search feature to the People CRUD route', () => {
    const banking = NAVIGATION_TREE.find((g) => g.label === 'Banking');
    const coreBanking = banking?.children?.find((m) => m.label === 'Core Banking');
    const operation = coreBanking?.children?.find((c) => c.label === 'Operation');
    const customerMgmt = operation?.children?.find((fg) => fg.label === 'Customer Management');
    const customerSearch = customerMgmt?.children?.find((f) => f.label === 'Customer Search');
    expect(customerSearch?.route).toBe('customers/list');
  });

  it('moduleIcon() and categoryIcon() always return a known icon name', () => {
    expect(moduleIcon('Core Banking')).toBe('bank');
    expect(moduleIcon('Something Unmatched')).toBe('generic-module');
    expect(categoryIcon('Operation')).toBe('bolt');
    expect(categoryIcon('Setup')).toBe('gear');
    expect(categoryIcon('Report')).toBe('bar-chart');
  });
});
