import { TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { describe, expect, it } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog.component';

function overlayButtons(): HTMLButtonElement[] {
  return Array.from(TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll('button'));
}

describe('ConfirmDialogComponent', () => {
  it('renders the confirm and cancel labels once open', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('confirmLabel', 'Delete');
    fixture.detectChanges();

    const labels = overlayButtons().map((b) => b.textContent?.trim());
    expect(labels).toContain('Delete');
    expect(labels).toContain('Cancel');
  });

  it('emits confirmed when the confirm button is clicked', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('confirmLabel', 'Delete');
    fixture.detectChanges();

    let confirmed = false;
    fixture.componentInstance.confirmed.subscribe(() => (confirmed = true));

    overlayButtons().find((b) => b.textContent?.trim() === 'Delete')!.click();

    expect(confirmed).toBe(true);
  });

  it('emits cancelled when the cancel button is clicked', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    let cancelled = false;
    fixture.componentInstance.cancelled.subscribe(() => (cancelled = true));

    overlayButtons().find((b) => b.textContent?.trim() === 'Cancel')!.click();

    expect(cancelled).toBe(true);
  });

  it('emits cancelled when the modal requests close (backdrop/Escape)', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    let cancelled = false;
    fixture.componentInstance.cancelled.subscribe(() => (cancelled = true));

    fixture.componentInstance.onCancel();

    expect(cancelled).toBe(true);
  });
});
