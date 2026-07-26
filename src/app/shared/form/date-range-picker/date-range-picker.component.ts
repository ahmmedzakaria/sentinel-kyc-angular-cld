import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { IconComponent } from '../../icon/icon.component';
import { BaseValueAccessor } from '../base-value-accessor';
import { addMonths, buildMonthGrid, formatDate, isAfter, isBefore, isSameDay, isWithinRange, WEEKDAY_LABELS } from '../date-utils';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

const EMPTY_RANGE: DateRange = { start: null, end: null };

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [OverlayModule, IconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: DateRangePickerComponent, multi: true }],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateRangePickerComponent extends BaseValueAccessor<DateRange> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select date range…');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly errorMessage = input<string | null>(null);

  protected readonly weekdayLabels = WEEKDAY_LABELS;
  protected readonly open = signal(false);
  protected readonly viewMonth = signal(startOfCurrentMonth());
  protected readonly hoverDate = signal<Date | null>(null);

  protected readonly weeks = computed(() => buildMonthGrid(this.viewMonth()));
  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(this.viewMonth())
  );
  protected readonly range = computed(() => this.value() ?? EMPTY_RANGE);
  protected readonly displayValue = computed(() => {
    const r = this.range();
    if (!r.start) {
      return '';
    }
    return r.end ? `${formatDate(r.start)} – ${formatDate(r.end)}` : `${formatDate(r.start)} – …`;
  });

  toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.open.update((v) => !v);
    if (this.open()) {
      const ref = this.range().start ?? new Date();
      this.viewMonth.set(startOfCurrentMonth(ref));
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

  isStart(date: Date): boolean {
    return isSameDay(date, this.range().start);
  }
  isEnd(date: Date): boolean {
    return isSameDay(date, this.range().end);
  }
  isInRange(date: Date): boolean {
    const r = this.range();
    if (r.start && r.end) {
      return isWithinRange(date, r.start, r.end);
    }
    // Preview the range while the user is choosing the end date.
    if (r.start && !r.end && this.hoverDate()) {
      const hover = this.hoverDate()!;
      return isAfter(hover, r.start) ? isWithinRange(date, r.start, hover) : isWithinRange(date, hover, r.start);
    }
    return false;
  }

  onDayHover(date: Date): void {
    this.hoverDate.set(date);
  }

  selectDate(date: Date): void {
    if (this.isDisabled(date)) {
      return;
    }
    const current = this.range();

    if (!current.start || (current.start && current.end)) {
      this.emitValue({ start: date, end: null });
      return;
    }

    // Have a start, choosing the end — swap if the user picked an earlier date.
    if (isBefore(date, current.start)) {
      this.emitValue({ start: date, end: current.start });
    } else {
      this.emitValue({ start: current.start, end: date });
    }
    this.close();
  }
}

function startOfCurrentMonth(ref: Date = new Date()): Date {
  return new Date(ref.getFullYear(), ref.getMonth(), 1);
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
