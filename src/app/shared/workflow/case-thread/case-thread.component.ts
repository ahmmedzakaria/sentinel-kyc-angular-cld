import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivityEntry, ActivityFeedComponent } from '../activity-feed/activity-feed.component';
import { TextareaComponent } from '../../form/textarea/textarea.component';
import { ButtonDirective } from '../../form/button/button.directive';

/**
 * ActivityFeed + a Textarea-based reply composer. Presentational, the same
 * "value in, change event out" shape as DataTable/Stepper — `entries` stays
 * owned by the consumer (the real thread, likely backend-persisted), and
 * `reply` is just the composed text; CaseThread doesn't optimistically
 * append to its own copy of the list, since that could drift from whatever
 * the consumer's create-request actually persists. Submitting always clears
 * the composer immediately, independent of whether/when `entries` catches up.
 */
@Component({
  selector: 'app-case-thread',
  standalone: true,
  imports: [ActivityFeedComponent, TextareaComponent, ButtonDirective, ReactiveFormsModule],
  templateUrl: './case-thread.component.html',
  styleUrl: './case-thread.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseThreadComponent {
  readonly entries = input.required<ActivityEntry[]>();
  readonly submitting = input(false);
  readonly placeholder = input('Write a reply…');

  readonly reply = output<string>();

  protected readonly draft = new FormControl('', { nonNullable: true });

  submit(): void {
    const value = this.draft.value.trim();
    if (!value || this.submitting()) {
      return;
    }
    this.reply.emit(value);
    this.draft.reset('');
  }
}
