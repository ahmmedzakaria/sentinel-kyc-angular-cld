import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

export type BannerSeverity = 'info' | 'success' | 'warning' | 'error';

const ICON_BY_SEVERITY: Record<BannerSeverity, string> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'alert-circle',
  error: 'alert-circle'
};

/**
 * Page-width severity-tinted strip — e.g. "3 KYC reviews expiring this week"
 * above a list page. Distinct from InlineAlert by scope/placement, not just
 * styling (see COMPONENT_LIBRARY_PLAN.md §5).
 */
@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {
  readonly severity = input<BannerSeverity>('info');
  readonly dismissible = input(false);
  readonly dismissed = output<void>();

  protected readonly icon = computed(() => ICON_BY_SEVERITY[this.severity()]);
}
