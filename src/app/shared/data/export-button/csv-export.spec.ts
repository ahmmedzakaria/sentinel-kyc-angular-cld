import { describe, expect, it } from 'vitest';
import { buildCsv, csvEscape, formatCell } from './csv-export';
import { ExportColumn } from './export-strategy';

interface Row {
  name: string;
  note: string | null;
}

describe('csvEscape', () => {
  it('leaves a plain value unquoted', () => {
    expect(csvEscape('Amina Osei')).toBe('Amina Osei');
  });

  it('quotes and doubles embedded quotes', () => {
    expect(csvEscape('5\'8" tall')).toBe('"5\'8"" tall"');
  });

  it('quotes a value containing a comma or newline', () => {
    expect(csvEscape('Dhaka, Bangladesh')).toBe('"Dhaka, Bangladesh"');
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('formatCell', () => {
  const columns: ExportColumn<Row>[] = [{ key: 'name', header: 'Name' }];

  it('stringifies the raw value when no formatter is given', () => {
    expect(formatCell<Row>({ name: 'Zaki', note: null }, columns[0])).toBe('Zaki');
  });

  it('renders null/undefined as an empty string', () => {
    const noteColumn: ExportColumn<Row> = { key: 'note', header: 'Note' };
    expect(formatCell<Row>({ name: 'Zaki', note: null }, noteColumn)).toBe('');
  });

  it('uses a custom formatter when provided', () => {
    const upperColumn: ExportColumn<Row> = { key: 'name', header: 'Name', format: (v) => String(v).toUpperCase() };
    expect(formatCell<Row>({ name: 'Zaki', note: null }, upperColumn)).toBe('ZAKI');
  });
});

describe('buildCsv', () => {
  it('builds a header row plus one row per record, CRLF-joined', () => {
    const columns: ExportColumn<Row>[] = [
      { key: 'name', header: 'Name' },
      { key: 'note', header: 'Note' }
    ];
    const rows: Row[] = [
      { name: 'Amina', note: null },
      { name: 'Dhaka, Team', note: 'VIP' }
    ];
    expect(buildCsv(rows, columns)).toBe('Name,Note\r\nAmina,\r\n"Dhaka, Team",VIP');
  });

  it('produces just the header row for an empty data set', () => {
    const columns: ExportColumn<Row>[] = [{ key: 'name', header: 'Name' }];
    expect(buildCsv([], columns)).toBe('Name');
  });
});
