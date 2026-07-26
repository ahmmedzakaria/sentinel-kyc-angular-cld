import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DropdownComponent, DropdownOption } from './dropdown.component';

const OPTIONS: DropdownOption<string>[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other', disabled: true }
];

@Component({
  standalone: true,
  imports: [DropdownComponent],
  template: `<app-dropdown [options]="options" [label]="'Gender'" />`
})
class HostComponent {
  options = OPTIONS;
}

describe('DropdownComponent', () => {
  it('shows the placeholder when no value is written', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.trigger .value');
    expect(trigger.textContent.trim()).toBe('Select…');
  });

  it('writeValue() displays the matching option label', () => {
    const fixture = TestBed.createComponent<DropdownComponent<string>>(DropdownComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    fixture.componentInstance.writeValue('Female');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.trigger .value');
    expect(trigger.textContent.trim()).toBe('Female');
  });

  it('selecting an option calls the registered onChange with its value', () => {
    const fixture = TestBed.createComponent<DropdownComponent<string>>(DropdownComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();

    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.toggle();
    fixture.componentInstance.selectOption(OPTIONS[0]);

    expect(emitted).toBe('Male');
    expect(fixture.componentInstance['open']()).toBe(false);
  });

  it('does not select a disabled option', () => {
    const fixture = TestBed.createComponent<DropdownComponent<string>>(DropdownComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();

    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));
    fixture.componentInstance.selectOption(OPTIONS[2]);

    expect(emitted).toBeNull();
  });

  it('ArrowDown from closed opens the panel and syncs the active index to the current value', () => {
    const fixture = TestBed.createComponent<DropdownComponent<string>>(DropdownComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    fixture.componentInstance.writeValue('Female');

    fixture.componentInstance.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

    expect(fixture.componentInstance['open']()).toBe(true);
    expect(fixture.componentInstance['activeIndex']()).toBe(1); // Female
  });

  it('Escape closes an open panel', () => {
    const fixture = TestBed.createComponent<DropdownComponent<string>>(DropdownComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    fixture.componentInstance.toggle();
    expect(fixture.componentInstance['open']()).toBe(true);

    fixture.componentInstance.onTriggerKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance['open']()).toBe(false);
  });

  it('setDisabledState() prevents toggle()', () => {
    const fixture = TestBed.createComponent<DropdownComponent<string>>(DropdownComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.componentInstance.toggle();
    expect(fixture.componentInstance['open']()).toBe(false);
  });
});
