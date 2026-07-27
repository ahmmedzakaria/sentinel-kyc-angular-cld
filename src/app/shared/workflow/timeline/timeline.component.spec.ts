import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TimelineComponent } from './timeline.component';

describe('TimelineComponent', () => {
  it('renders one item per event', () => {
    const fixture = TestBed.createComponent(TimelineComponent);
    fixture.componentRef.setInput('events', [
      { label: 'Submitted', timestamp: new Date('2026-01-01T10:00:00') },
      { label: 'Reviewed', timestamp: new Date('2026-01-02T11:00:00'), actor: 'Amina Osei' }
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.timeline-item').length).toBe(2);
  });

  it('shows the actor only when provided', () => {
    const fixture = TestBed.createComponent(TimelineComponent);
    fixture.componentRef.setInput('events', [
      { label: 'Submitted', timestamp: new Date('2026-01-01T10:00:00') },
      { label: 'Reviewed', timestamp: new Date('2026-01-02T11:00:00'), actor: 'Amina Osei' }
    ]);
    fixture.detectChanges();

    const metas: HTMLElement[] = fixture.nativeElement.querySelectorAll('.timeline-meta');
    expect(metas[0].textContent).not.toContain('Amina Osei');
    expect(metas[1].textContent).toContain('Amina Osei');
  });

  it('formatTimestamp() accepts both a Date and an ISO string', () => {
    const fixture = TestBed.createComponent(TimelineComponent);
    fixture.componentRef.setInput('events', []);
    fixture.detectChanges();

    const fromDate = fixture.componentInstance.formatTimestamp(new Date('2026-01-01T10:00:00'));
    const fromString = fixture.componentInstance.formatTimestamp('2026-01-01T10:00:00');
    expect(fromDate).toBe(fromString);
    expect(fromDate.length).toBeGreaterThan(0);
  });
});
