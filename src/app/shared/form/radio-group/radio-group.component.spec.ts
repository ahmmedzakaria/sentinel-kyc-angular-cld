import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { RadioGroupComponent, RadioOption } from './radio-group.component';

const OPTIONS: RadioOption<string>[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Unsure', value: 'unsure', disabled: true }
];

describe('RadioGroupComponent', () => {
  it('writeValue() checks the matching native radio', () => {
    const fixture = TestBed.createComponent(RadioGroupComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentInstance.writeValue('no');
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
    expect(inputs[1].checked).toBe(true);
    expect(inputs[0].checked).toBe(false);
  });

  it('selecting an option emits its value', () => {
    const fixture = TestBed.createComponent(RadioGroupComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.select(OPTIONS[0]);

    expect(emitted).toBe('yes');
  });

  it('does not select a disabled option', () => {
    const fixture = TestBed.createComponent(RadioGroupComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    fixture.componentInstance.select(OPTIONS[2]);

    expect(emitted).toBeNull();
  });

  it('all native radios in the group share the same name attribute', () => {
    const fixture = TestBed.createComponent(RadioGroupComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
    const names = new Set(Array.from(inputs).map((i) => i.name));
    expect(names.size).toBe(1);
  });
});
