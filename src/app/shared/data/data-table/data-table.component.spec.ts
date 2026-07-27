import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ColumnDef, DataTableComponent, SortState } from './data-table.component';

interface Row {
  id: number;
  name: string;
}

const COLUMNS: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'id', header: 'ID' }
];

function create() {
  const fixture = TestBed.createComponent<DataTableComponent<Row>>(DataTableComponent);
  fixture.componentRef.setInput('columns', COLUMNS);
  fixture.componentRef.setInput('data', [
    { id: 1, name: 'Amina' },
    { id: 2, name: 'Zaki' }
  ]);
  fixture.detectChanges();
  return fixture;
}

describe('DataTableComponent', () => {
  it('renders the empty state when data is empty', () => {
    const fixture = TestBed.createComponent<DataTableComponent<Row>>(DataTableComponent);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('app-empty-state');
    expect(emptyState).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('tr.data-row').length).toBe(0);
  });

  it('shows the loading row instead of data or empty state while loading', () => {
    const fixture = TestBed.createComponent<DataTableComponent<Row>>(DataTableComponent);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.loading-row')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeFalsy();
  });

  it('renders one row per data item once loaded', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelectorAll('tr.data-row').length).toBe(2);
  });

  it('toggleSort() cycles asc → desc → none for the same column', () => {
    const fixture = create();
    const instance = fixture.componentInstance;
    const emitted: SortState[] = [];
    instance.sortChange.subscribe((s) => emitted.push(s));

    const nameCol = COLUMNS[0];
    instance.toggleSort(nameCol);
    fixture.componentRef.setInput('sort', emitted[0]);
    instance.toggleSort(nameCol);
    fixture.componentRef.setInput('sort', emitted[1]);
    instance.toggleSort(nameCol);

    expect(emitted).toEqual([
      { key: 'name', direction: 'asc' },
      { key: 'name', direction: 'desc' },
      { key: 'name', direction: 'none' }
    ]);
  });

  it('toggleSort() on a non-sortable column does nothing', () => {
    const fixture = create();
    const instance = fixture.componentInstance;
    const emitted: SortState[] = [];
    instance.sortChange.subscribe((s) => emitted.push(s));

    instance.toggleSort(COLUMNS[1]); // 'id' has no sortable: true
    expect(emitted).toEqual([]);
  });

  it('switching to a different sortable column always starts at asc', () => {
    const columns: ColumnDef<Row>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'id', header: 'ID', sortable: true }
    ];
    const fixture = TestBed.createComponent<DataTableComponent<Row>>(DataTableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('sort', { key: 'name', direction: 'desc' });
    fixture.detectChanges();

    const emitted: SortState[] = [];
    fixture.componentInstance.sortChange.subscribe((s) => emitted.push(s));
    fixture.componentInstance.toggleSort(columns[1]);
    expect(emitted).toEqual([{ key: 'id', direction: 'asc' }]);
  });

  it('ariaSort() reports "none" for an unsorted sortable column and null for a non-sortable one', () => {
    const fixture = create();
    expect(fixture.componentInstance.ariaSort(COLUMNS[0])).toBe('none');
    expect(fixture.componentInstance.ariaSort(COLUMNS[1])).toBeNull();
  });

  it('ariaSort() reports ascending/descending for the active sort column', () => {
    const fixture = create();
    fixture.componentRef.setInput('sort', { key: 'name', direction: 'asc' });
    fixture.detectChanges();
    expect(fixture.componentInstance.ariaSort(COLUMNS[0])).toBe('ascending');

    fixture.componentRef.setInput('sort', { key: 'name', direction: 'desc' });
    fixture.detectChanges();
    expect(fixture.componentInstance.ariaSort(COLUMNS[0])).toBe('descending');
  });

  it('emits rowClick with the clicked row', () => {
    const fixture = create();
    const emitted: Row[] = [];
    fixture.componentInstance.rowClick.subscribe((r) => emitted.push(r));

    fixture.nativeElement.querySelector('tr.data-row').click();
    expect(emitted).toEqual([{ id: 1, name: 'Amina' }]);
  });

  it('renders the internal Pagination control only when page/total are both set', () => {
    const withoutPaging = create();
    expect(withoutPaging.nativeElement.querySelector('app-pagination')).toBeFalsy();

    const withPaging = TestBed.createComponent<DataTableComponent<Row>>(DataTableComponent);
    withPaging.componentRef.setInput('columns', COLUMNS);
    withPaging.componentRef.setInput('data', []);
    withPaging.componentRef.setInput('page', 1);
    withPaging.componentRef.setInput('total', 20);
    withPaging.detectChanges();
    expect(withPaging.nativeElement.querySelector('app-pagination')).toBeTruthy();
  });
});
