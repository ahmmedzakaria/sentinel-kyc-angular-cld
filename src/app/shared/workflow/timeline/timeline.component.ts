import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

export interface TimelineEvent {
  label: string;
  timestamp: Date | string;
  actor?: string;
  icon?: string;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent {
  readonly events = input.required<TimelineEvent[]>();

  formatTimestamp(value: Date | string): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }
}
