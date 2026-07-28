import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PillComponent, PillTone } from '../pill/pill.component';

export type StatusTone = 'pending' | 'approved' | 'risk' | 'active' | 'suspended' | 'draft' | 'rejected' | 'escalated';

interface StatusPreset {
  tone: PillTone;
  label: string;
}

// Record (not a switch) so adding a StatusTone member without a matching
// preset here is a TypeScript compile error, not a silent runtime fallback.
const STATUS_PRESETS: Record<StatusTone, StatusPreset> = {
  pending: { tone: 'amber', label: 'Pending' },
  approved: { tone: 'accent', label: 'Approved' },
  risk: { tone: 'red', label: 'Elevated Risk' },
  active: { tone: 'success', label: 'Active' },
  suspended: { tone: 'red', label: 'Suspended' },
  draft: { tone: 'neutral', label: 'Draft' },
  rejected: { tone: 'red', label: 'Rejected' },
  escalated: { tone: 'amber', label: 'Escalated' }
};

/**
 * A preset of Pill for entity status — maps a closed set of status strings to
 * the semantic tone + default label, replacing the ad hoc
 * `.pill.pending/.approved/.risk` CSS previously duplicated in dashboard and
 * people-list.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [PillComponent],
  template: `<app-pill [label]="label() ?? preset().label" [tone]="preset().tone" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  readonly status = input.required<StatusTone>();
  /** Overrides the default display text for `status` — e.g. a Transloco-translated label. */
  readonly label = input<string | null>(null);

  protected readonly preset = computed(() => STATUS_PRESETS[this.status()]);
}
