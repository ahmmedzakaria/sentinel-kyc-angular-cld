import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FavoriteNavService } from './favorite-nav.service';
import { QuickNavService } from './quick-nav.service';

describe('FavoriteNavService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with no favorites when localStorage is empty', () => {
    const service = TestBed.inject(FavoriteNavService);
    expect(service.count()).toBe(0);
    expect(service.favorites()).toEqual([]);
  });

  it('toggle() adds and then removes a known path key', () => {
    const quickNav = TestBed.inject(QuickNavService);
    const service = TestBed.inject(FavoriteNavService);
    const item = quickNav.items[0];

    service.toggle(item.pathKey);
    expect(service.isFavorite(item.pathKey)).toBe(true);
    expect(service.favorites()).toContainEqual(item);

    service.toggle(item.pathKey);
    expect(service.isFavorite(item.pathKey)).toBe(false);
  });

  it('toggle() ignores a path key that is not in the quick-nav index', () => {
    const service = TestBed.inject(FavoriteNavService);
    service.toggle('999.999.999.999.999');
    expect(service.count()).toBe(0);
  });

  it('persists favorites to localStorage across service instances', () => {
    const quickNav = TestBed.inject(QuickNavService);
    const service = TestBed.inject(FavoriteNavService);
    const item = quickNav.items[1];
    service.toggle(item.pathKey);

    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(FavoriteNavService);
    expect(reloaded.isFavorite(item.pathKey)).toBe(true);
  });

  it('drops a stale favorite whose path no longer exists in the tree', () => {
    localStorage.setItem('sentinel-kyc.favorite.navigation', JSON.stringify(['not.a.real.path.key']));
    const service = TestBed.inject(FavoriteNavService);
    expect(service.count()).toBe(0);
  });
});
