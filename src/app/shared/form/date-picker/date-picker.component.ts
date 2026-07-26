import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { IconComponent } from '../../icon/icon.component';
import { BaseValueAccessor } from '../base-value-accessor';
import { addDays, addMonths, buildMonthGrid, formatDate, isSameDay, WEEKDAY_LABELS } from '../date-utils';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [OverlayModule, IconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: DatePickerComponent, multi: true }],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent extends BaseValueAccessor<Date> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select date…');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly errorMessage = input<string | null>(null);

  protected readonly weekdayLabels = WEEKDAY_LABELS;
  protected readonly open = signal(false);
  protected readonly viewMonth = signal(startOfCurrentMonth());
  protected readonly focusedDate = signal<Date>(new Date());

  protected readonly weeks = computed(() => buildMonthGrid(this.viewMonth()));
  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(this.viewMonth())
  );

  toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.open.update((v) => !v);
    if (this.open()) {
      const ref = this.value() ?? new Date();
      this.viewMonth.set(startOfCurrentMonth(ref));
      this.focusedDate.set(ref);
    } else {
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

  prevMonth(): void {
    this.viewMonth.update((m) => addMonths(m, -1));
  }

  nextMonth(): void {
    this.viewMonth.update((m) => addMonths(m, 1));
  }

  isDisabled(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    if (min && date < stripTime(min)) {
      return true;
    }
    if (max && date > stripTime(max)) {
      return true;
    }
    return false;
  }

  isSelected(date: Date): boolean {
    return isSameDay(date, this.value());
  }

  isFocused(date: Date): boolean {
    return isSameDay(date, this.focusedDate());
  }

  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  selectDate(date: Date): void {
    if (this.isDisabled(date)) {
      return;
    }
    this.emitValue(date);
    this.close();
  }

  protected readonly displayValue = computed(() => formatDate(this.value()));

  onGridKeydown(event: KeyboardEvent): void {
    const deltas: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7
    };
    if (event.key in deltas) {
      event.preventDefault();
      const next = addDays(this.focusedDate(), deltas[event.key]);
      this.focusedDate.set(next);
      if (next.getMonth() !== this.viewMonth().getMonth() || next.getFullYear() !== this.viewMonth().getFullYear()) {
        this.viewMonth.set(startOfCurrentMonth(next));
      }
      return;
    }
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDate(this.focusedDate());
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'PageUp':
        event.preventDefault();
        this.prevMonth();
        break;
      case 'PageDown':
        event.preventDefault();
        this.nextMonth();
        break;
    }
  }
}

function startOfCurrentMonth(ref: Date = new Date()): Date {
  return new Date(ref.getFullYear(), ref.getMonth(), 1);
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
