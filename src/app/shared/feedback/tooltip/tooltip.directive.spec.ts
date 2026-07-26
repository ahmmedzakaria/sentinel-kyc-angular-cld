import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { describe, expect, it } from 'vitest';
import { TooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `<button appTooltip="Save this record">Save</button>`
})
class HostComponent {}

function overlayText(): string {
  return TestBed.inject(OverlayContainer).getContainerElement().textContent ?? '';
}

describe('TooltipDirective', () => {
  it('shows the tooltip bubble and sets aria-describedby on mouseenter', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(overlayText()).toContain('Save this record');
    expect(button.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('hides the tooltip bubble and clears aria-describedby on mouseleave', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    button.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();

    expect(overlayText()).not.toContain('Save this record');
    expect(button.hasAttribute('aria-describedby')).toBe(false);
  });

  it('shows on keyboard focus, not just hover', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.focus();
    fixture.detectChanges();

    expect(overlayText()).toContain('Save this record');
  });
});
