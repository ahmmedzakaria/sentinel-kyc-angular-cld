import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  it('writeValue() populates the native textarea', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentInstance.writeValue('a note');
    fixture.detectChanges();
    const el: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(el.value).toBe('a note');
  });

  it('typing emits the new value', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.detectChanges();
    let emitted: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (emitted = v));

    const el: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    el.value = 'typed';
    el.dispatchEvent(new Event('input'));

    expect(emitted).toBe('typed');
  });

  it('charCount reflects the current value length and updates the counter', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('maxLength', 100);
    fixture.componentInstance.writeValue('12345');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.counter').textContent.trim()).toBe('5/100');
  });

  it('omits maxlength attribute entirely when maxLength is not set', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.detectChanges();
    const el: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(el.hasAttribute('maxlength')).toBe(false);
  });
});
