import { DestroyRef, Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { FocusMonitor } from '@angular/cdk/a11y';
import { TooltipPanelComponent } from './tooltip-panel.component';

export type TooltipPosition = 'above' | 'below' | 'start' | 'end';

const POSITIONS: Record<TooltipPosition, ConnectedPosition[]> = {
  above: [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 }],
  below: [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 }],
  start: [{ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -6 }],
  end: [{ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 6 }]
};

let nextUid = 0;

/**
 * Attaches a CDK-Overlay tooltip bubble to any host element. Per the §8
 * accessibility requirement, it triggers on keyboard focus (via CDK's
 * FocusMonitor) as well as mouse hover, and exposes the bubble through
 * `aria-describedby` rather than moving DOM focus into it.
 *
 * A directive rather than a component — same reasoning as ButtonDirective
 * (§7/§13): a tooltip decorates an *existing* element, it doesn't wrap it in
 * new markup.
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly destroyRef = inject(DestroyRef);

  readonly appTooltip = input<string>('');
  readonly tooltipPosition = input<TooltipPosition>('above');

  private readonly uid = `tooltip-${nextUid++}`;
  private overlayRef: OverlayRef | null = null;

  constructor() {
    this.focusMonitor.monitor(this.elementRef).subscribe((origin) => (origin ? this.show() : this.hide()));
    this.destroyRef.onDestroy(() => {
      this.focusMonitor.stopMonitoring(this.elementRef);
      this.overlayRef?.dispose();
    });
  }

  @HostListener('mouseenter') onMouseEnter(): void {
    this.show();
  }
  @HostListener('mouseleave') onMouseLeave(): void {
    this.hide();
  }
  @HostListener('keydown.escape') onEscape(): void {
    this.hide();
  }

  private show(): void {
    const text = this.appTooltip();
    if (this.overlayRef || !text) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(POSITIONS[this.tooltipPosition()])
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    const ref = this.overlayRef.attach(new ComponentPortal(TooltipPanelComponent));
    ref.setInput('text', text);
    ref.setInput('uid', this.uid);

    this.elementRef.nativeElement.setAttribute('aria-describedby', this.uid);
  }

  private hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.elementRef.nativeElement.removeAttribute('aria-describedby');
  }
}
