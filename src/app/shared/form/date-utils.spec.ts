import { describe, expect, it } from 'vitest';
import { addDays, addMonths, buildMonthGrid, formatDate, isAfter, isBefore, isSameDay, isWithinRange, startOfMonth } from './date-utils';

describe('date-utils', () => {
  it('startOfMonth() returns the 1st at local midnight', () => {
    const d = startOfMonth(new Date(2026, 6, 23));
    expect(d.getDate()).toBe(1);
    expect(d.getMonth()).toBe(6);
  });

  it('addMonths() rolls over into the next year correctly', () => {
    const d = addMonths(new Date(2026, 11, 15), 1);
    expect(d.getFullYear()).toBe(2027);
    expect(d.getMonth()).toBe(0);
  });

  it('addDays() rolls over month boundaries', () => {
    const d = addDays(new Date(2026, 0, 30), 5);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(4);
  });

  it('isSameDay() compares only the date portion, and handles null', () => {
    expect(isSameDay(new Date(2026, 6, 23, 9, 0), new Date(2026, 6, 23, 18, 0))).toBe(true);
    expect(isSameDay(new Date(2026, 6, 23), new Date(2026, 6, 24))).toBe(false);
    expect(isSameDay(null, new Date())).toBe(false);
  });

  it('isBefore()/isAfter() ignore time-of-day', () => {
    const morning = new Date(2026, 6, 23, 1, 0);
    const evening = new Date(2026, 6, 24, 23, 0);
    expect(isBefore(morning, evening)).toBe(true);
    expect(isAfter(evening, morning)).toBe(true);
    expect(isBefore(morning, morning)).toBe(false);
  });

  it('isWithinRange() is exclusive of the start/end boundaries', () => {
    const start = new Date(2026, 6, 10);
    const end = new Date(2026, 6, 20);
    expect(isWithinRange(new Date(2026, 6, 15), start, end)).toBe(true);
    expect(isWithinRange(start, start, end)).toBe(false);
    expect(isWithinRange(end, start, end)).toBe(false);
    expect(isWithinRange(new Date(2026, 6, 15), null, end)).toBe(false);
  });

  it('buildMonthGrid() produces exactly 6 weeks of 7 days each', () => {
    const grid = buildMonthGrid(new Date(2026, 6, 1));
    expect(grid.length).toBe(6);
    grid.forEach((week) => expect(week.length).toBe(7));
  });

  it('buildMonthGrid() marks leading/trailing days from adjacent months', () => {
    // July 2026 starts on a Wednesday, so the first row includes June days.
    const grid = buildMonthGrid(new Date(2026, 6, 1));
    expect(grid[0][0].otherMonth).toBe(true);
    const juneDayCount = grid.flat().filter((d) => d.otherMonth && d.date.getMonth() === 5).length;
    expect(juneDayCount).toBeGreaterThan(0);
  });

  it('buildMonthGrid() includes every day of the target month exactly once, in order', () => {
    const grid = buildMonthGrid(new Date(2026, 1, 1)); // Feb 2026 (28 days)
    const febDays = grid.flat().filter((d) => !d.otherMonth);
    expect(febDays.length).toBe(28);
    expect(febDays.map((d) => d.date.getDate())).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
  });

  it('formatDate() handles null and formats a real date', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(new Date(2026, 6, 23))).toBe('Jul 23, 2026');
  });
});
