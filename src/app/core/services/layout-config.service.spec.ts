import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LayoutConfigService } from './layout-config.service';
import { LayoutConfig } from '../models/layout-config.model';

const FIXTURE: LayoutConfig = {
  navTree: [{ label: 'Banking', type: 'group', icon: '🏦', children: [] }],
  header: { searchTypes: ['Customer Name'], apps: [], tenants: ['Prime Bank Ltd.'], languages: [{ code: 'en', label: 'English' }] },
  statusBar: { systemStatusLabel: 'System Operational', envLabel: 'Production', version: 'v2.4.1' },
  themes: [
    {
      id: 'light',
      label: 'Light',
      base: 'light',
      swatch: 'sun',
      primaries: { text: '#1a222c', paper: '#f3f5f7', card: '#ffffff', accent: '#1f6f5c', amber: '#a8630b', red: '#9f2b2b', success: '#1c7a4c', info: '#2f7dd1' }
    }
  ],
  sizes: { spaceUnit: 2, radiusBase: 8, fontSizeBase: 13.5, headerHeight: 58, statusBarHeight: 28 }
};

describe('LayoutConfigService', () => {
  let service: LayoutConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(LayoutConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('starts unloaded with empty defaults', () => {
    expect(service.loaded()).toBe(false);
    expect(service.navTree()).toEqual([]);
    expect(service.header()).toBeNull();
  });

  it('ensureLoaded() fetches the config asset and populates every signal', () => {
    let resolved: LayoutConfig | undefined;
    service.ensureLoaded().subscribe((config) => (resolved = config));

    const req = httpMock.expectOne('/assets/config/layout-config.json');
    expect(req.request.method).toBe('GET');
    req.flush(FIXTURE);

    expect(resolved).toEqual(FIXTURE);
    expect(service.loaded()).toBe(true);
    expect(service.navTree()).toEqual(FIXTURE.navTree);
    expect(service.header()).toEqual(FIXTURE.header);
    expect(service.statusBar()).toEqual(FIXTURE.statusBar);
    expect(service.themes()).toEqual(FIXTURE.themes);
    expect(service.sizes()).toEqual(FIXTURE.sizes);
  });

  it('ensureLoaded() only issues one HTTP request even when called multiple times', () => {
    service.ensureLoaded().subscribe();
    service.ensureLoaded().subscribe();

    const req = httpMock.expectOne('/assets/config/layout-config.json');
    req.flush(FIXTURE);

    // A third call after the first resolves should also skip the network.
    let resolved: LayoutConfig | undefined;
    service.ensureLoaded().subscribe((config) => (resolved = config));
    httpMock.expectNone('/assets/config/layout-config.json');
    expect(resolved).toEqual(FIXTURE);
  });

  it('applyConfig() seeds state synchronously without an HTTP call', () => {
    service.applyConfig(FIXTURE);
    expect(service.loaded()).toBe(true);
    expect(service.navTree()).toEqual(FIXTURE.navTree);
    httpMock.expectNone('/assets/config/layout-config.json');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
