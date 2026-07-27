import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ApprovalActionsComponent, ApprovalDecision } from './approval-actions.component';

function create() {
  const fixture = TestBed.createComponent(ApprovalActionsComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ApprovalActionsComponent', () => {
  it('approve() emits immediately with no reason', () => {
    const fixture = create();
    const emitted: ApprovalDecision[] = [];
    fixture.componentInstance.decided.subscribe((d) => emitted.push(d));

    fixture.componentInstance.approve();
    expect(emitted).toEqual([{ action: 'approve' }]);
  });

  it('requestReject() opens the reason prompt without emitting yet', () => {
    const fixture = create();
    const emitted: ApprovalDecision[] = [];
    fixture.componentInstance.decided.subscribe((d) => emitted.push(d));

    fixture.componentInstance.requestReject();
    expect(fixture.componentInstance['pendingAction']()).toBe('reject');
    expect(emitted).toEqual([]);
  });

  it('confirmReason() with an empty reason sets an error and does not emit', () => {
    const fixture = create();
    const emitted: ApprovalDecision[] = [];
    fixture.componentInstance.decided.subscribe((d) => emitted.push(d));

    fixture.componentInstance.requestReject();
    fixture.componentInstance.confirmReason();

    expect(emitted).toEqual([]);
    expect(fixture.componentInstance['reasonError']()).toBe(true);
    // Still open — the user can correct the reason and try again.
    expect(fixture.componentInstance['pendingAction']()).toBe('reject');
  });

  it('confirmReason() with a non-empty (trimmed) reason emits and closes the prompt', () => {
    const fixture = create();
    const emitted: ApprovalDecision[] = [];
    fixture.componentInstance.decided.subscribe((d) => emitted.push(d));

    fixture.componentInstance.requestEscalate();
    fixture.componentInstance['reason'].setValue('  Needs senior review  ');
    fixture.componentInstance.confirmReason();

    expect(emitted).toEqual([{ action: 'escalate', reason: 'Needs senior review' }]);
    expect(fixture.componentInstance['pendingAction']()).toBeNull();
  });

  it('cancelReason() closes the prompt without emitting', () => {
    const fixture = create();
    const emitted: ApprovalDecision[] = [];
    fixture.componentInstance.decided.subscribe((d) => emitted.push(d));

    fixture.componentInstance.requestReject();
    fixture.componentInstance['reason'].setValue('some reason');
    fixture.componentInstance.cancelReason();

    expect(emitted).toEqual([]);
    expect(fixture.componentInstance['pendingAction']()).toBeNull();
  });

  it('opening a fresh reason prompt clears any previous error/value', () => {
    const fixture = create();

    fixture.componentInstance.requestReject();
    fixture.componentInstance.confirmReason(); // empty -> sets reasonError
    fixture.componentInstance.cancelReason();

    fixture.componentInstance.requestEscalate();
    expect(fixture.componentInstance['reasonError']()).toBe(false);
    expect(fixture.componentInstance['reason'].value).toBe('');
  });
});
