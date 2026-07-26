import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { IconComponent } from '../../icon/icon.component';
import { BaseValueAccessor } from '../base-value-accessor';
import { DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [OverlayModule, IconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: MultiSelectComponent, multi: true }],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectComponent<T = string> extends BaseValueAccessor<T[]> {
  readonly options = input.required<DropdownOption<T>[]>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select…');
  readonly errorMessage = input<string | null>(null);
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);

  protected readonly open = signal(false);

  protected readonly selectedOptions = computed<DropdownOption<T>[]>(() => {
    const values = this.value() ?? [];
    if (!values.length) {
      return [];
    }
    const cmp = this.compareWith();
    return this.options().filter((o) => values.some((v) => cmp(o.value, v)));
  });

  toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.open.update((v) => !v);
    if (!this.open()) {
      this.markTouched();
    }
  }

  close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.markTouched();
  }

  isSelected(option: DropdownOption<T>): boolean {
    const cmp = this.compareWith();
    return (this.value() ?? []).some((v) => cmp(v, option.value));
  }

  toggleOption(option: DropdownOption<T>): void {
    if (option.disabled) {
      return;
    }
    const cmp = this.compareWith();
    const current = this.value() ?? [];
    const next = this.isSelected(option) ? current.filter((v) => !cmp(v, option.value)) : [...current, option.value];
    this.emitValue(next);
  }

  removeChip(option: DropdownOption<T>, event: Event): void {
    event.stopPropagation();
    this.toggleOption(option);
  }
}
