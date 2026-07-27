import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PaginationComponent } from './pagination.component';

function create(page: number, pageSize: number, total: number) {
  const fixture = TestBed.createComponent(PaginationComponent);
  fixture.componentRef.setInput('page', page);
  fixture.componentRef.setInput('pageSize', pageSize);
  fixture.componentRef.setInput('total', total);
  fixture.detectChanges();
  return fixture;
}

describe('PaginationComponent', () => {
  it('computes total pages from total/pageSize', () => {
    const fixture = create(1, 10, 42);
    expect(fixture.componentInstance['totalPages']()).toBe(5);
  });

  it('disables prev/first on the first page but allows next/last', () => {
    const fixture = create(1, 10, 42);
    expect(fixture.componentInstance['canPrev']()).toBe(false);
    expect(fixture.componentInstance['canNext']()).toBe(true);
  });

  it('disables next/last on the last page but allows prev/first', () => {
    const fixture = create(5, 10, 42);
    expect(fixture.componentInstance['canPrev']()).toBe(true);
    expect(fixture.componentInstance['canNext']()).toBe(false);
  });

  it('computes the visible range for a middle page', () => {
    const fixture = create(2, 10, 42);
    expect(fixture.componentInstance['rangeStart']()).toBe(11);
    expect(fixture.componentInstance['rangeEnd']()).toBe(20);
  });

  it('clamps the last page range to the total instead of overrunning it', () => {
    const fixture = create(5, 10, 42);
    expect(fixture.componentInstance['rangeStart']()).toBe(41);
    expect(fixture.componentInstance['rangeEnd']()).toBe(42);
  });

  it('emits pageChange when next()/prev() move within bounds', () => {
    const fixture = create(2, 10, 42);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emitted.push(p));
    fixture.componentInstance.next();
    fixture.componentInstance.prev();
    expect(emitted).toEqual([3, 1]);
  });

  it('does not emit pageChange when already on the first/last page', () => {
    const first = create(1, 10, 42);
    const firstEmitted: number[] = [];
    first.componentInstance.pageChange.subscribe((p) => firstEmitted.push(p));
    first.componentInstance.prev();
    expect(firstEmitted).toEqual([]);

    const last = create(5, 10, 42);
    const lastEmitted: number[] = [];
    last.componentInstance.pageChange.subscribe((p) => lastEmitted.push(p));
    last.componentInstance.next();
    expect(lastEmitted).toEqual([]);
  });

  it('first()/last() jump straight to page 1 / totalPages', () => {
    const fixture = create(3, 10, 42);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emitted.push(p));
    fixture.componentInstance.first();
    fixture.componentInstance.last();
    expect(emitted).toEqual([1, 5]);
  });

  it('handles a zero-total (empty) state without throwing', () => {
    const fixture = create(1, 10, 0);
    expect(fixture.componentInstance['totalPages']()).toBe(1);
    expect(fixture.componentInstance['rangeStart']()).toBe(0);
    expect(fixture.componentInstance['rangeEnd']()).toBe(0);
  });
});
