import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TextboxComponent } from './textbox.component';

describe('TextboxComponent', () => {
  it('writeValue() populates the native input', () => {
    const fixture = TestBed.createComponent(TextboxComponent);
    fixture.componentInstance.writeValue('hello@example.com');
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('hello@example.com');
  });

  it('typing emits the new value via registerOnChange', () => {
    const fixture = TestBed.createComponent(TextboxComponent);
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'jane';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toBe('jane');
  });

  it('blur calls the registered onTouched callback', () => {
    const fixture = TestBed.createComponent(TextboxComponent);
    fixture.detectChanges();
    let touched = false;
    fixture.componentInstance.registerOnTouched(() => (touched = true));

    fixture.nativeElement.querySelector('input').dispatchEvent(new Event('blur'));

    expect(touched).toBe(true);
  });

  it('setDisabledState() disables the native input', () => {
    const fixture = TestBed.createComponent(TextboxComponent);
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('renders the error message when set', () => {
    const fixture = TestBed.createComponent(TextboxComponent);
    fixture.componentRef.setInput('errorMessage', 'Required');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error').textContent.trim()).toBe('Required');
  });
});
