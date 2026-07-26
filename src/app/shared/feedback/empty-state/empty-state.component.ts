import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

/**
 * Replaces the one-off empty-table markup in people-list — icon + title +
 * message, with an optional action button projected via ng-content (e.g.
 * "Add Person").
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  readonly icon = input<string>('folder');
  readonly title = input<string>('');
  readonly message = input<string>('');
}
