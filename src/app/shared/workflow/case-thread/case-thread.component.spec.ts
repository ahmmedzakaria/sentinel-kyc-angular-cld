import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CaseThreadComponent } from './case-thread.component';
import { ActivityEntry } from '../activity-feed/activity-feed.component';

const INITIAL_ENTRIES: ActivityEntry[] = [{ label: 'opened the case', timestamp: new Date('2026-01-01T09:00:00'), actor: 'Amina Osei' }];

function create() {
  const fixture = TestBed.createComponent(CaseThreadComponent);
  fixture.componentRef.setInput('entries', INITIAL_ENTRIES);
  fixture.detectChanges();
  return fixture;
}

describe('CaseThreadComponent', () => {
  it('submit() does nothing with an empty (or whitespace-only) draft', () => {
    const fixture = create();
    const emitted: string[] = [];
    fixture.componentInstance.reply.subscribe((r) => emitted.push(r));

    fixture.componentInstance.submit();
    fixture.componentInstance['draft'].setValue('   ');
    fixture.componentInstance.submit();

    expect(emitted).toEqual([]);
  });

  it('submit() emits the trimmed reply and clears the composer', () => {
    const fixture = create();
    const emitted: string[] = [];
    fixture.componentInstance.reply.subscribe((r) => emitted.push(r));

    fixture.componentInstance['draft'].setValue('  Following up on this. ');
    fixture.componentInstance.submit();

    expect(emitted).toEqual(['Following up on this.']);
    expect(fixture.componentInstance['draft'].value).toBe('');
  });

  it('submit() is a no-op while submitting() is true', () => {
    const fixture = TestBed.createComponent(CaseThreadComponent);
    fixture.componentRef.setInput('entries', INITIAL_ENTRIES);
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.reply.subscribe((r) => emitted.push(r));
    fixture.componentInstance['draft'].setValue('Following up.');
    fixture.componentInstance.submit();

    expect(emitted).toEqual([]);
  });

  it('a new entry appended to `entries` (simulating the consumer persisting the reply) renders in the feed', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelectorAll('.activity-item').length).toBe(1);

    fixture.componentRef.setInput('entries', [
      ...INITIAL_ENTRIES,
      { label: 'replied', timestamp: new Date('2026-01-02T09:00:00'), actor: 'Zaki Ahmmed' }
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.activity-item').length).toBe(2);
  });
});
