import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalComponent } from '../../modal/modal.component';
import { ButtonDirective } from '../../form/button/button.directive';

/**
 * Thin wrapper over the existing ModalComponent for a confirm/cancel prompt —
 * replaces the hand-built confirm modal previously inlined in
 * people-list.component.html. Project custom body content (e.g. a name in
 * bold) via the default slot; falls back to plain `message()` text when
 * nothing is projected.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, ButtonDirective],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  readonly open = input.required<boolean>();
  readonly title = input<string>('Confirm');
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');
  readonly danger = input(false);
  readonly loading = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onCancel(): void {
    this.cancelled.emit();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }
}
