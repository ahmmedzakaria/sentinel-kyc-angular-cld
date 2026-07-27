import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { FilterBarComponent } from './filter-bar.component';
import { SearchToolbarEvent } from '../search-toolbar/search-toolbar.component';

describe('FilterBarComponent', () => {
  it('forwards the embedded SearchToolbar\'s search event unchanged', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.detectChanges();

    const emitted: SearchToolbarEvent[] = [];
    fixture.componentInstance.searched.subscribe((e) => emitted.push(e));

    fixture.componentInstance.onSearch({ type: 'name', query: 'jane' });
    expect(emitted).toEqual([{ type: 'name', query: 'jane' }]);
  });

  it('emits chipRemoved with the removed chip\'s key', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.chipRemoved.subscribe((key) => emitted.push(key));

    fixture.componentInstance.removeChip('status:approved');
    expect(emitted).toEqual(['status:approved']);
  });

  it('emits cleared when clearAll() is invoked', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    fixture.detectChanges();

    let clearedCount = 0;
    fixture.componentInstance.cleared.subscribe(() => clearedCount++);

    fixture.componentInstance.clearAll();
    expect(clearedCount).toBe(1);
  });
});
