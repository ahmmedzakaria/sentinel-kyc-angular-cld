import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import layoutConfig from '../../../assets/config/layout-config.json';
import { QuickNavService } from './quick-nav.service';
import { LayoutConfigService } from './layout-config.service';
import { LayoutConfig } from '../models/layout-config.model';

describe('QuickNavService', () => {
  beforeEach(() => {
    TestBed.inject(LayoutConfigService).applyConfig(layoutConfig as LayoutConfig);
  });

  it('generates a unique, non-empty code for every feature leaf', () => {
    const service = TestBed.inject(QuickNavService);
    const codes = service.items().map((item) => item.code);
    expect(codes.length).toBeGreaterThan(0);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('finds an item by its exact code, case-insensitively', () => {
    const service = TestBed.inject(QuickNavService);
    const item = service.items()[0];
    expect(service.findByCode(item.code.toLowerCase())).toBe(item);
  });

  it('findByCode() falls back to a label match when the code does not match', () => {
    const service = TestBed.inject(QuickNavService);
    const item = service.items().find((i) => i.label === 'Customer Search');
    expect(item).toBeTruthy();
    expect(service.findByCode('Customer Search')).toBe(item);
  });

  it('findByCode() returns undefined for an empty query', () => {
    const service = TestBed.inject(QuickNavService);
    expect(service.findByCode('')).toBeUndefined();
  });

  it('search() returns nothing below the minimum character threshold', () => {
    const service = TestBed.inject(QuickNavService);
    expect(service.search('c')).toEqual([]);
  });

  it('search() matches by label text', () => {
    const service = TestBed.inject(QuickNavService);
    const results = service.search('Customer Search');
    expect(results.some((item) => item.label === 'Customer Search')).toBe(true);
  });

  it('getByPathKey()/hasPathKey() resolve a known path key', () => {
    const service = TestBed.inject(QuickNavService);
    const item = service.items()[0];
    expect(service.hasPathKey(item.pathKey)).toBe(true);
    expect(service.getByPathKey(item.pathKey)).toBe(item);
  });

  it('items() is empty before config loads', () => {
    TestBed.resetTestingModule();
    const service = TestBed.inject(QuickNavService);
    expect(service.items()).toEqual([]);
  });
});
