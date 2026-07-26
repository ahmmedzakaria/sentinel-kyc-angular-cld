export interface CalendarDay {
  date: Date;
  otherMonth: boolean;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, count: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + count, 1);
}

export function addDays(d: Date, count: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + count);
  return next;
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) {
    return false;
  }
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isBefore(a: Date, b: Date): boolean {
  return stripTime(a).getTime() < stripTime(b).getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return stripTime(a).getTime() > stripTime(b).getTime();
}

export function isWithinRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) {
    return false;
  }
  const t = stripTime(d).getTime();
  return t > stripTime(start).getTime() && t < stripTime(end).getTime();
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Builds a 6x7 (42-cell) month grid, including the leading/trailing days
 * from the adjacent months needed to fill complete weeks — the standard
 * calendar-grid shape.
 */
export function buildMonthGrid(monthRef: Date): CalendarDay[][] {
  const firstOfMonth = startOfMonth(monthRef);
  const firstWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = addDays(firstOfMonth, -firstWeekday);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    days.push({ date, otherMonth: date.getMonth() !== monthRef.getMonth() });
  }

  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < 6; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }
  return weeks;
}

export function formatDate(d: Date | null): string {
  if (!d) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

export const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
