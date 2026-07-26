import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { MultiSelectComponent } from './multi-select.component';
import { DropdownOption } from '../dropdown/dropdown.component';

const OPTIONS: DropdownOption<string>[] = [
  { label: 'Read', value: 'read' },
  { label: 'Write', value: 'write' },
  { label: 'Admin', value: 'admin', disabled: true }
];

describe('MultiSelectComponent', () => {
  it('toggling an unselected option adds it to the emitted array', () => {
    const fixture = TestBed.createComponent(MultiSelectComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.toggleOption(OPTIONS[0]);

    expect(emitted).toEqual(['read']);
  });

  it('toggling an already-selected option removes it', () => {
    const fixture = TestBed.createComponent(MultiSelectComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentInstance.writeValue(['read', 'write']);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.toggleOption(OPTIONS[0]);

    expect(emitted).toEqual(['write']);
  });

  it('does not toggle a disabled option', () => {
    const fixture = TestBed.createComponent(MultiSelectComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    let emitted: string[] | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.toggleOption(OPTIONS[2]);

    expect(emitted).toBeNull();
  });

  it('selecting an option does not close the panel', () => {
    const fixture = TestBed.createComponent(MultiSelectComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    fixture.componentInstance.toggle();

    fixture.componentInstance.toggleOption(OPTIONS[0]);

    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('selectedOptions() derives the full option objects from the value array', () => {
    const fixture = TestBed.createComponent(MultiSelectComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentInstance.writeValue(['write']);
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedOptions()).toEqual([{ label: 'Write', value: 'write' }]);
  });
});
