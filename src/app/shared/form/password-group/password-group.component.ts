import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../../icon/icon.component';
import { BaseValueAccessor } from '../base-value-accessor';

let nextUid = 0;

/**
 * Deliberately self-contained rather than nesting <app-textbox> internally —
 * bridging two ControlValueAccessors (this component's, and an inner
 * Textbox's) adds real complexity for very little reuse benefit here. It
 * shares Textbox's visual language via the same field-shell mixins instead.
 */
@Component({
  selector: 'app-password-group',
  standalone: true,
  imports: [IconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: PasswordGroupComponent, multi: true }],
  templateUrl: './password-group.component.html',
  styleUrl: './password-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordGroupComponent extends BaseValueAccessor<string> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string | null>(null);
  readonly errorMessage = input<string | null>(null);

  protected readonly visible = signal(false);
  protected readonly uid = `pg-${nextUid++}`;

  toggleVisibility(): void {
    this.visible.update((v) => !v);
  }

  onInput(event: Event): void {
    this.emitValue((event.target as HTMLInputElement).value);
  }
}
