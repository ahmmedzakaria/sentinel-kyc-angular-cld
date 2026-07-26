import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BaseValueAccessor } from './base-value-accessor';

@Component({
  standalone: true,
  template: ''
})
class TestAccessor extends BaseValueAccessor<string> {
  triggerChange(v: string | null): void {
    this.emitValue(v);
  }
  triggerTouch(): void {
    this.markTouched();
  }
}

describe('BaseValueAccessor', () => {
  it('writeValue() sets the value signal', () => {
    const fixture = TestBed.createComponent(TestAccessor);
    fixture.componentInstance.writeValue('hello');
    expect(fixture.componentInstance.value()).toBe('hello');
  });

  it('emitValue() updates the signal and calls the registered onChange', () => {
    const fixture = TestBed.createComponent(TestAccessor);
    let received: string | null = null;
    fixture.componentInstance.registerOnChange((v) => (received = v));

    fixture.componentInstance.triggerChange('new value');

    expect(received).toBe('new value');
    expect(fixture.componentInstance.value()).toBe('new value');
  });

  it('markTouched() calls the registered onTouched callback', () => {
    const fixture = TestBed.createComponent(TestAccessor);
    let touched = false;
    fixture.componentInstance.registerOnTouched(() => (touched = true));

    fixture.componentInstance.triggerTouch();

    expect(touched).toBe(true);
  });

  it('setDisabledState() updates the disabled signal', () => {
    const fixture = TestBed.createComponent(TestAccessor);
    expect(fixture.componentInstance.disabled()).toBe(false);
    fixture.componentInstance.setDisabledState(true);
    expect(fixture.componentInstance.disabled()).toBe(true);
  });

  it('does not throw when onChange/onTouched are never registered', () => {
    const fixture = TestBed.createComponent(TestAccessor);
    expect(() => fixture.componentInstance.triggerChange('x')).not.toThrow();
    expect(() => fixture.componentInstance.triggerTouch()).not.toThrow();
  });
});
