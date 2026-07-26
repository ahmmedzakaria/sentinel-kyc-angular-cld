import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  it('writeValue(true) checks the native input', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentInstance.writeValue(true);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.checked).toBe(true);
  });

  it('clicking toggles and emits the new value', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.detectChanges();
    let emitted: boolean | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change'));

    expect(emitted).toBe(true);
  });

  it('sets the native indeterminate DOM property', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.indeterminate).toBe(true);
  });

  it('setDisabledState() disables the native input', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });
});
