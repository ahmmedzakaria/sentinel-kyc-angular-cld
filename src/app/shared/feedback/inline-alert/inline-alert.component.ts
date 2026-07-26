import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

const ICON_BY_SEVERITY: Record<AlertSeverity, string> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'alert-circle',
  error: 'alert-circle'
};

/**
 * Compact severity-tinted note that sits inside a form/section — e.g. "This
 * email is already registered" above a form field. Distinct from Banner by
 * scope/placement (see COMPONENT_LIBRARY_PLAN.md §5): a small inline strip,
 * not a page-width bar, with no dismiss affordance.
 */
@Component({
  selector: 'app-inline-alert',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './inline-alert.component.html',
  styleUrl: './inline-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineAlertComponent {
  readonly severity = input<AlertSeverity>('info');

  protected readonly icon = computed(() => ICON_BY_SEVERITY[this.severity()]);
}
