import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DropdownAsyncComponent } from './dropdown-async.component';
import { DropdownOption } from '../dropdown/dropdown.component';

const ALL: DropdownOption<string>[] = [
  { label: 'Alice', value: 'alice' },
  { label: 'Bob', value: 'bob' },
  { label: 'Carol', value: 'carol' }
];

function search(query: string): DropdownOption<string>[] {
  return ALL.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
}

describe('DropdownAsyncComponent', () => {
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

  it('opening triggers an initial load with an empty query', () => {
    const loadOptions = vi.fn((q: string) => of(search(q)));
    const fixture = TestBed.createComponent<DropdownAsyncComponent<string>>(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', loadOptions);
    fixture.detectChanges();

    fixture.componentInstance.toggle();
    vi.advanceTimersByTime(400);

    expect(loadOptions).toHaveBeenCalledWith('');
    expect(fixture.componentInstance['options']().length).toBe(3);
  });

  it('typing debounces before calling loadOptions again', () => {
    const loadOptions = vi.fn((q: string) => of(search(q)));
    const fixture = TestBed.createComponent<DropdownAsyncComponent<string>>(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', loadOptions);
    fixture.detectChanges();
    fixture.componentInstance.toggle();
    vi.advanceTimersByTime(400);
    loadOptions.mockClear();

    fixture.componentInstance.onQueryInput({ target: { value: 'a' } } as unknown as Event);
    fixture.componentInstance.onQueryInput({ target: { value: 'al' } } as unknown as Event);
    vi.advanceTimersByTime(100); // still within debounce window
    expect(loadOptions).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300); // debounce elapses
    expect(loadOptions).toHaveBeenCalledTimes(1);
    expect(loadOptions).toHaveBeenCalledWith('al');
  });

  it('selecting an option emits its value and sets the display label', () => {
    const fixture = TestBed.createComponent<DropdownAsyncComponent<string>>(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', (q: string) => of(search(q)));
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.selectOption(ALL[1]);

    expect(emitted).toBe('bob');
    expect(fixture.componentInstance['selectedLabel']()).toBe('Bob');
    expect(fixture.componentInstance['open']()).toBe(false);
  });

  it('a loadOptions() that throws synchronously resolves to an empty list instead of crashing', () => {
    const fixture = TestBed.createComponent<DropdownAsyncComponent<string>>(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', () => {
      throw new Error('network error');
    });
    fixture.detectChanges();

    expect(() => {
      fixture.componentInstance.toggle();
      vi.advanceTimersByTime(400);
    }).not.toThrow();

    expect(fixture.componentInstance['options']()).toEqual([]);
    expect(fixture.componentInstance['loading']()).toBe(false);
  });

  it('initialOption pre-fills the display label without calling loadOptions', () => {
    const fixture = TestBed.createComponent<DropdownAsyncComponent<string>>(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', (q: string) => of(search(q)));
    fixture.componentRef.setInput('initialOption', { label: 'Carol', value: 'carol' });
    fixture.componentInstance.writeValue('carol');
    fixture.detectChanges();

    expect(fixture.componentInstance['selectedLabel']()).toBe('Carol');
  });
});
