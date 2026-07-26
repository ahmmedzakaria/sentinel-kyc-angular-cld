import { describe, expect, it } from 'vitest';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  it('starts with just Home and a default title', () => {
    const service = new BreadcrumbService();
    expect(service.trail()).toEqual([{ label: 'Home' }]);
    expect(service.title()).toBe('Dashboard');
  });

  it('set() prefixes the path with Home and updates the title', () => {
    const service = new BreadcrumbService();
    service.set(['Customers', 'List'], 'List');
    expect(service.trail()).toEqual([{ label: 'Home' }, { label: 'Customers' }, { label: 'List' }]);
    expect(service.title()).toBe('List');
  });

  it('reset() collapses back to just Home', () => {
    const service = new BreadcrumbService();
    service.set(['Customers', 'List'], 'List');
    service.reset('Signed out');
    expect(service.trail()).toEqual([{ label: 'Home' }]);
    expect(service.title()).toBe('Signed out');
  });
});
