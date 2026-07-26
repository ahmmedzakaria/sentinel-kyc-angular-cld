import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
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
  it('opening triggers an initial load with an empty query', fakeAsync(() => {
    const loadOptions = vi.fn((q: string) => of(search(q)));
    const fixture = TestBed.createComponent(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', loadOptions);
    fixture.detectChanges();

    fixture.componentInstance.toggle();
    tick(400);

    expect(loadOptions).toHaveBeenCalledWith('');
    expect(fixture.componentInstance.options().length).toBe(3);
  }));

  it('typing debounces before calling loadOptions again', fakeAsync(() => {
    const loadOptions = vi.fn((q: string) => of(search(q)));
    const fixture = TestBed.createComponent(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', loadOptions);
    fixture.detectChanges();
    fixture.componentInstance.toggle();
    tick(400);
    loadOptions.mockClear();

    fixture.componentInstance.onQueryInput({ target: { value: 'a' } } as unknown as Event);
    fixture.componentInstance.onQueryInput({ target: { value: 'al' } } as unknown as Event);
    tick(100); // still within debounce window
    expect(loadOptions).not.toHaveBeenCalled();

    tick(300); // debounce elapses
    expect(loadOptions).toHaveBeenCalledTimes(1);
    expect(loadOptions).toHaveBeenCalledWith('al');
  }));

  it('selecting an option emits its value and sets the display label', fakeAsync(() => {
    const fixture = TestBed.createComponent(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', (q: string) => of(search(q)));
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.selectOption(ALL[1]);

    expect(emitted).toBe('bob');
    expect(fixture.componentInstance.selectedLabel()).toBe('Bob');
    expect(fixture.componentInstance.open()).toBe(false);
  }));

  it('a loadOptions() that throws synchronously resolves to an empty list instead of crashing', fakeAsync(() => {
    const fixture = TestBed.createComponent(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', () => {
      throw new Error('network error');
    });
    fixture.detectChanges();

    expect(() => {
      fixture.componentInstance.toggle();
      tick(400);
    }).not.toThrow();

    expect(fixture.componentInstance.options()).toEqual([]);
    expect(fixture.componentInstance.loading()).toBe(false);
  }));

  it('initialOption pre-fills the display label without calling loadOptions', () => {
    const fixture = TestBed.createComponent(DropdownAsyncComponent);
    fixture.componentRef.setInput('loadOptions', (q: string) => of(search(q)));
    fixture.componentRef.setInput('initialOption', { label: 'Carol', value: 'carol' });
    fixture.componentInstance.writeValue('carol');
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedLabel()).toBe('Carol');
  });
});
