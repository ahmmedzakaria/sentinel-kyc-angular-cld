import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PillComponent } from './pill.component';

describe('PillComponent', () => {
  it('renders the label', () => {
    const fixture = TestBed.createComponent(PillComponent);
    fixture.componentRef.setInput('label', 'Draft');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pill').textContent.trim()).toBe('Draft');
  });

  it('applies the tone class', () => {
    const fixture = TestBed.createComponent(PillComponent);
    fixture.componentRef.setInput('label', 'Active');
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pill').classList.contains('success')).toBe(true);
  });

  it('hides the dot when dot=false', () => {
    const fixture = TestBed.createComponent(PillComponent);
    fixture.componentRef.setInput('label', 'Count');
    fixture.componentRef.setInput('dot', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pill').classList.contains('no-dot')).toBe(true);
  });
});
