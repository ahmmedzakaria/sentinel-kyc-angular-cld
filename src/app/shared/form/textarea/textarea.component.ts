import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueAccessor } from '../base-value-accessor';

let nextUid = 0;

@Component({
  selector: 'app-textarea',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TextareaComponent, multi: true }],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent extends BaseValueAccessor<string> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input<number>(4);
  readonly maxLength = input<number | null>(null);
  readonly errorMessage = input<string | null>(null);

  protected readonly uid = `ta-${nextUid++}`;
  protected readonly charCount = computed(() => (this.value() ?? '').length);

  onInput(event: Event): void {
    this.emitValue((event.target as HTMLTextAreaElement).value);
  }
}
