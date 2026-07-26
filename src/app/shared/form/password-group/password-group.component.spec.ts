import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PasswordGroupComponent } from './password-group.component';

describe('PasswordGroupComponent', () => {
  it('defaults to type="password"', () => {
    const fixture = TestBed.createComponent(PasswordGroupComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('password');
  });

  it('toggle button switches to type="text" and back', () => {
    const fixture = TestBed.createComponent(PasswordGroupComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.toggle');

    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').type).toBe('text');

    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').type).toBe('password');
  });

  it('typing emits the new value', () => {
    const fixture = TestBed.createComponent(PasswordGroupComponent);
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'secret123';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toBe('secret123');
  });

  it('updates aria-pressed/aria-label to reflect visibility state', () => {
    const fixture = TestBed.createComponent(PasswordGroupComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.toggle');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Show password');

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Hide password');
  });
});
