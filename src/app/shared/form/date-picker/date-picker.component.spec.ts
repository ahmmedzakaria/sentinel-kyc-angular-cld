import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DatePickerComponent } from './date-picker.component';

describe('DatePickerComponent', () => {
  it('selecting an enabled date emits it and closes the panel', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.detectChanges();
    let emitted: Date | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    const d = new Date(2026, 6, 15);
    fixture.componentInstance.toggle();
    fixture.componentInstance.selectDate(d);

    expect(emitted).toEqual(d);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('does not select a date before min', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('min', new Date(2026, 6, 10));
    fixture.detectChanges();
    let emitted: Date | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.selectDate(new Date(2026, 6, 5));

    expect(emitted).toBeNull();
  });

  it('does not select a date after max', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('max', new Date(2026, 6, 20));
    fixture.detectChanges();
    let emitted: Date | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.selectDate(new Date(2026, 6, 25));

    expect(emitted).toBeNull();
  });

  it('nextMonth()/prevMonth() move the visible grid by one month', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.detectChanges();
    const before = fixture.componentInstance['viewMonth']();
    fixture.componentInstance.nextMonth();
    const after = fixture.componentInstance['viewMonth']();
    expect(after.getMonth()).toBe((before.getMonth() + 1) % 12);
  });

  it('ArrowRight moves the focused date forward one day', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.detectChanges();
    fixture.componentInstance['focusedDate'].set(new Date(2026, 6, 15));

    fixture.componentInstance.onGridKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    expect(fixture.componentInstance['focusedDate']().getDate()).toBe(16);
  });

  it('Enter on the grid selects the focused date', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.detectChanges();
    let emitted: Date | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));
    fixture.componentInstance['focusedDate'].set(new Date(2026, 6, 15));

    fixture.componentInstance.onGridKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual(new Date(2026, 6, 15));
  });
});
