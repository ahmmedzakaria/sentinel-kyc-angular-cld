import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ButtonDirective } from './button.directive';

@Component({
  standalone: true,
  imports: [ButtonDirective],
  template: `<button appButton [variant]="variant" [loading]="loading">Save</button>`
})
class HostComponent {
  variant: 'primary' | 'ghost' | 'danger' = 'primary';
  loading = false;
}

describe('ButtonDirective', () => {
  it('applies the base and variant classes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('btn')).toBe(true);
    expect(btn.classList.contains('btn-primary')).toBe(true);
  });

  it('switches variant classes reactively', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.variant = 'danger';
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('btn-danger')).toBe(true);
    expect(btn.classList.contains('btn-primary')).toBe(false);
  });

  it('adds btn-loading and aria-busy when loading', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('btn-loading')).toBe(true);
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('does not set aria-busy when not loading', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.hasAttribute('aria-busy')).toBe(false);
  });
});
