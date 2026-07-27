import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The bubble content attached by TooltipDirective. Always the same inverted
 * (background/foreground swapped) look regardless of theme — built from
 * `var(--text)`/`var(--paper)` rather than a new token, so it stays correct
 * across all 7 themes without introducing a tooltip-specific color.
 */
@Component({
  selector: 'app-tooltip-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="tooltip-panel" role="tooltip" [id]="uid()">{{ text() }}</span>`,
  styles: [
    `
      .tooltip-panel {
        display: inline-block;
        /* 240px is a one-off for this bubble, not on the --space-* scale —
           computed from the primitive rather than a bare literal. Plain CSS
           here (Angular inline component styles aren't Sass-processed), so
           var()/calc() rather than a $variable. */
        max-width: calc(var(--space-unit) * 120);
        padding: var(--space-3) var(--space-5);
        background: var(--text);
        color: var(--paper);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-base);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow);
        pointer-events: none;
      }
    `
  ]
})
export class TooltipPanelComponent {
  readonly text = input<string>('');
  readonly uid = input<string>('');
}
