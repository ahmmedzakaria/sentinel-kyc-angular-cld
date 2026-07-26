import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DropdownAsyncScrollableComponent, DropdownPage } from './dropdown-async-scrollable.component';

function page(pageNum: number, totalPages: number): DropdownPage<string> {
  return {
    items: [{ label: `Item ${pageNum}`, value: `item-${pageNum}` }],
    hasMore: pageNum < totalPages - 1
  };
}

function scrollEvent(scrollTop: number, scrollHeight: number, clientHeight: number): Event {
  return { target: { scrollTop, scrollHeight, clientHeight } } as unknown as Event;
}

describe('DropdownAsyncScrollableComponent', () => {
  // RxJS's asyncScheduler (used by debounceTime) schedules via the global
  // setTimeout/setInterval that vi.useFakeTimers() intercepts — this app is
  // zoneless (see README), so fakeAsync()/tick() (which require zone.js)
  // aren't available or appropriate here.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opening loads page 0', () => {
    const loadPage = vi.fn((q: string, p: number) => of(page(p, 3)));
    const fixture = TestBed.createComponent<DropdownAsyncScrollableComponent<string>>(DropdownAsyncScrollableComponent);
    fixture.componentRef.setInput('loadPage', loadPage);
    fixture.detectChanges();

    fixture.componentInstance.toggle();
    vi.advanceTimersByTime(400);

    expect(loadPage).toHaveBeenCalledWith('', 0);
    expect(fixture.componentInstance['options']().length).toBe(1);
  });

  it('scrolling near the bottom loads the next page and appends (not replaces)', () => {
    const loadPage = vi.fn((q: string, p: number) => of(page(p, 3)));
    const fixture = TestBed.createComponent<DropdownAsyncScrollableComponent<string>>(DropdownAsyncScrollableComponent);
    fixture.componentRef.setInput('loadPage', loadPage);
    fixture.detectChanges();
    fixture.componentInstance.toggle();
    vi.advanceTimersByTime(400);

    fixture.componentInstance.onPanelScroll(scrollEvent(400, 440, 300)); // 40px from bottom, under the 48px threshold
    vi.advanceTimersByTime(0);

    expect(loadPage).toHaveBeenCalledWith('', 1);
    expect(fixture.componentInstance['options']().map((o) => o.value)).toEqual(['item-0', 'item-1']);
  });

  it('does not trigger another load while one is already in flight', () => {
    const loadPage = vi.fn((q: string, p: number) => of(page(p, 5)));
    const fixture = TestBed.createComponent<DropdownAsyncScrollableComponent<string>>(DropdownAsyncScrollableComponent);
    fixture.componentRef.setInput('loadPage', loadPage);
    fixture.detectChanges();
    fixture.componentInstance.toggle();
    vi.advanceTimersByTime(400);
    loadPage.mockClear();

    fixture.componentInstance['loadingMore'].set(true);
    fixture.componentInstance.onPanelScroll(scrollEvent(400, 440, 300));

    expect(loadPage).not.toHaveBeenCalled();
  });

  it('does not load further pages once hasMore is false', () => {
    const loadPage = vi.fn((q: string, p: number) => of({ items: [{ label: 'Only', value: 'only' }], hasMore: false }));
    const fixture = TestBed.createComponent<DropdownAsyncScrollableComponent<string>>(DropdownAsyncScrollableComponent);
    fixture.componentRef.setInput('loadPage', loadPage);
    fixture.detectChanges();
    fixture.componentInstance.toggle();
    vi.advanceTimersByTime(400);
    loadPage.mockClear();

    fixture.componentInstance.onPanelScroll(scrollEvent(400, 440, 300));

    expect(loadPage).not.toHaveBeenCalled();
  });

  it('typing a new search resets to page 0 and replaces (not appends) the list', () => {
    const loadPage = vi.fn((q: string, p: number) => of(page(p, 3)));
    const fixture = TestBed.createComponent<DropdownAsyncScrollableComponent<string>>(DropdownAsyncScrollableComponent);
    fixture.componentRef.setInput('loadPage', loadPage);
    fixture.detectChanges();
    fixture.componentInstance.toggle();
    vi.advanceTimersByTime(400);
    fixture.componentInstance.onPanelScroll(scrollEvent(400, 440, 300));
    vi.advanceTimersByTime(0);
    expect(fixture.componentInstance['options']().length).toBe(2);

    fixture.componentInstance.onQueryInput({ target: { value: 'x' } } as unknown as Event);
    vi.advanceTimersByTime(400);

    expect(fixture.componentInstance['options']().length).toBe(1);
    expect(fixture.componentInstance['page']()).toBe(0);
  });

  it('a loadPage() that throws synchronously resolves to an empty page instead of crashing', () => {
    const fixture = TestBed.createComponent<DropdownAsyncScrollableComponent<string>>(DropdownAsyncScrollableComponent);
    fixture.componentRef.setInput('loadPage', () => {
      throw new Error('network error');
    });
    fixture.detectChanges();

    expect(() => {
      fixture.componentInstance.toggle();
      vi.advanceTimersByTime(400);
    }).not.toThrow();

    expect(fixture.componentInstance['options']()).toEqual([]);
    expect(fixture.componentInstance['hasMore']()).toBe(false);
  });
});
