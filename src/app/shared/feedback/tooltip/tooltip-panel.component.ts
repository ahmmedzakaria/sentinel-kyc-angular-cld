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
        max-width: 240px;
        padding: 6px 10px;
        background: var(--text);
        color: var(--paper);
        font-size: 12px;
        line-height: 1.4;
        border-radius: 6px;
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
