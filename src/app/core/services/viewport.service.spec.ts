import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ViewportService } from './viewport.service';

// jsdom (this project's test environment) doesn't implement matchMedia at
// all, unlike a real browser — it must be stubbed onto `window` fresh rather
// than spied on with vi.spyOn(), which requires the property to already
// exist as a function.
function stubMatchMedia(initialMatches: boolean): { listeners: Array<(e: MediaQueryListEvent) => void> } {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  window.matchMedia = vi.fn().mockReturnValue({
    matches: initialMatches,
    media: '(min-width: 1024px)',
    addEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void) => listeners.push(listener),
    removeEventListener: () => {}
  } as unknown as MediaQueryList);
  return { listeners };
}

describe('ViewportService', () => {
  afterEach(() => {
    // @ts-expect-error — restoring jsdom's actual (absent) matchMedia
    delete window.matchMedia;
  });

  it('reflects matchMedia(min-width: 1024px) at construction time', () => {
    stubMatchMedia(true);

    const service = TestBed.inject(ViewportService);
    expect(service.isDesktop()).toBe(true);
  });

  it('updates isDesktop() when the media query change event fires', () => {
    const { listeners } = stubMatchMedia(true);

    const service = TestBed.inject(ViewportService);
    expect(service.isDesktop()).toBe(true);

    listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent));
    expect(service.isDesktop()).toBe(false);
  });

  it('defaults to desktop when matchMedia is unavailable (e.g. this test environment without stubbing)', () => {
    const service = TestBed.inject(ViewportService);
    expect(service.isDesktop()).toBe(true);
  });
});
