import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../../icon/icon.component';
import { BaseValueAccessor } from '../base-value-accessor';

export type TextboxType = 'text' | 'email' | 'tel' | 'number';

let nextUid = 0;

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [IconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TextboxComponent, multi: true }],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextboxComponent extends BaseValueAccessor<string> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<TextboxType>('text');
  readonly errorMessage = input<string | null>(null);
  readonly prefixIcon = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);

  protected readonly uid = `tb-${nextUid++}`;

  onInput(event: Event): void {
    this.emitValue((event.target as HTMLInputElement).value);
  }
}
