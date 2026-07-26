import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DateRange, DateRangePickerComponent } from './date-range-picker.component';

describe('DateRangePickerComponent', () => {
  it('first click sets start with no end, and does not close the panel', () => {
    const fixture = TestBed.createComponent(DateRangePickerComponent);
    fixture.detectChanges();
    let emitted: DateRange | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));
    fixture.componentInstance.toggle();

    fixture.componentInstance.selectDate(new Date(2026, 6, 10));

    expect(emitted).toEqual({ start: new Date(2026, 6, 10), end: null });
    expect(fixture.componentInstance['open']()).toBe(true);
  });

  it('second click (later date) sets end and closes the panel', () => {
    const fixture = TestBed.createComponent(DateRangePickerComponent);
    fixture.detectChanges();
    let emitted: DateRange | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));
    fixture.componentInstance.toggle();

    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    fixture.componentInstance.selectDate(new Date(2026, 6, 20));

    expect(emitted).toEqual({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 20) });
    expect(fixture.componentInstance['open']()).toBe(false);
  });

  it('second click on an earlier date swaps start/end instead of producing an invalid range', () => {
    const fixture = TestBed.createComponent(DateRangePickerComponent);
    fixture.detectChanges();
    let emitted: DateRange | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.selectDate(new Date(2026, 6, 20));
    fixture.componentInstance.selectDate(new Date(2026, 6, 10));

    expect(emitted).toEqual({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 20) });
  });

  it('a third click after a complete range starts a fresh selection', () => {
    const fixture = TestBed.createComponent(DateRangePickerComponent);
    fixture.detectChanges();
    let emitted: DateRange | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.selectDate(new Date(2026, 6, 10));
    fixture.componentInstance.selectDate(new Date(2026, 6, 20));
    fixture.componentInstance.selectDate(new Date(2026, 6, 5));

    expect(emitted).toEqual({ start: new Date(2026, 6, 5), end: null });
  });

  it('does not select a disabled (out of min/max bounds) date', () => {
    const fixture = TestBed.createComponent(DateRangePickerComponent);
    fixture.componentRef.setInput('max', new Date(2026, 6, 15));
    fixture.detectChanges();
    let emitted: DateRange | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.selectDate(new Date(2026, 6, 20));

    expect(emitted).toBeNull();
  });
});
