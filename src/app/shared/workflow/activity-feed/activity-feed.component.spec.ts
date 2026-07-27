import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ActivityFeedComponent } from './activity-feed.component';

describe('ActivityFeedComponent', () => {
  it('renders one entry per activity, with the actor attributed', () => {
    const fixture = TestBed.createComponent(ActivityFeedComponent);
    fixture.componentRef.setInput('entries', [
      { label: 'approved the KYC review', timestamp: new Date('2026-01-01T10:00:00'), actor: 'Amina Osei' },
      { label: 'flagged a document', timestamp: new Date('2026-01-02T11:00:00'), actor: 'Zaki Ahmmed' }
    ]);
    fixture.detectChanges();

    const items: HTMLElement[] = fixture.nativeElement.querySelectorAll('.activity-item');
    expect(items.length).toBe(2);
    expect(items[0].querySelector('.activity-label')?.textContent).toContain('Amina Osei');
    expect(items[0].querySelector('.activity-label')?.textContent).toContain('approved the KYC review');
  });

  it('initials() takes the first letter of up to the first two words', () => {
    const fixture = TestBed.createComponent(ActivityFeedComponent);
    fixture.componentRef.setInput('entries', []);
    fixture.detectChanges();

    expect(fixture.componentInstance.initials('Amina Osei')).toBe('AO');
    expect(fixture.componentInstance.initials('Cher')).toBe('C');
    expect(fixture.componentInstance.initials('  Zaki   Ahmmed  ')).toBe('ZA');
  });

  it('renders avatar initials next to each entry', () => {
    const fixture = TestBed.createComponent(ActivityFeedComponent);
    fixture.componentRef.setInput('entries', [{ label: 'joined the case', timestamp: new Date(), actor: 'Maria Chen' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.activity-avatar')?.textContent?.trim()).toBe('MC');
  });
});
