import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StatusBadgeComponent, StatusTone } from './status-badge.component';

const ALL_STATUSES: StatusTone[] = ['pending', 'approved', 'risk', 'active', 'suspended', 'draft'];

describe('StatusBadgeComponent', () => {
  it.each(ALL_STATUSES)('renders a non-empty default label for status "%s"', (status) => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector('.pill').textContent.trim();
    expect(text.length).toBeGreaterThan(0);
  });

  it('the label input overrides the default text', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('status', 'pending');
    fixture.componentRef.setInput('label', 'Custom Label');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pill').textContent.trim()).toBe('Custom Label');
  });
});
