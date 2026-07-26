import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PillTone = 'accent' | 'amber' | 'red' | 'success' | 'info' | 'neutral';

/**
 * Generic labeled pill on a semantic color token — the building block behind
 * StatusBadge (a preset of this for entity status) and usable directly for
 * anything else that needs a colored tag (counts, tiers, categories).
 */
@Component({
  selector: 'app-pill',
  standalone: true,
  templateUrl: './pill.component.html',
  styleUrl: './pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PillComponent {
  readonly label = input.required<string>();
  readonly tone = input<PillTone>('neutral');
  /** The small leading dot — set false for a plain text pill (e.g. a count badge). */
  readonly dot = input(true);
}
