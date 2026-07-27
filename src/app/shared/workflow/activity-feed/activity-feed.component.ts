import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ActivityEntry {
  label: string;
  timestamp: Date | string;
  /** Required (unlike Timeline's optional `actor`) — this is the whole point of the variant: attribution, not just an event log. */
  actor: string;
}

/**
 * A specialized Timeline variant (COMPONENT_LIBRARY_PLAN.md §5), not a
 * separate build from scratch — shares the vertical-line-and-dot layout via
 * `../_timeline-shell.scss`'s mixins, swapping Timeline's icon marker for
 * actor initials.
 */
@Component({
  selector: 'app-activity-feed',
  standalone: true,
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFeedComponent {
  readonly entries = input.required<ActivityEntry[]>();

  formatTimestamp(value: Date | string): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  initials(actor: string): string {
    return actor
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }
}
