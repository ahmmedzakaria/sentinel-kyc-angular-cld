import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SearchToolbarComponent, SearchToolbarEvent } from './search-toolbar.component';

describe('SearchToolbarComponent', () => {
  it('defaults effectiveType to the first configured search type', () => {
    const fixture = TestBed.createComponent(SearchToolbarComponent);
    fixture.componentRef.setInput('searchTypes', [
      { value: 'name', label: 'Name' },
      { value: 'email', label: 'Email' }
    ]);
    fixture.detectChanges();
    expect(fixture.componentInstance['effectiveType']()).toBe('name');
  });

  it('effectiveType is null when no search types are configured', () => {
    const fixture = TestBed.createComponent(SearchToolbarComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance['effectiveType']()).toBeNull();
  });

  it('setType() overrides the default type', () => {
    const fixture = TestBed.createComponent(SearchToolbarComponent);
    fixture.componentRef.setInput('searchTypes', [
      { value: 'name', label: 'Name' },
      { value: 'email', label: 'Email' }
    ]);
    fixture.detectChanges();
    fixture.componentInstance.setType('email');
    expect(fixture.componentInstance['effectiveType']()).toBe('email');
  });

  it('runSearch() emits the current type and trimmed query', () => {
    const fixture = TestBed.createComponent(SearchToolbarComponent);
    fixture.componentRef.setInput('searchTypes', [{ value: 'name', label: 'Name' }]);
    fixture.detectChanges();

    const emitted: SearchToolbarEvent[] = [];
    fixture.componentInstance.searched.subscribe((e) => emitted.push(e));

    fixture.componentInstance.setQuery('  jane doe  ');
    fixture.componentInstance.runSearch();

    expect(emitted).toEqual([{ type: 'name', query: 'jane doe' }]);
  });

  it('runSearch() emits an empty query as an empty string, not throwing', () => {
    const fixture = TestBed.createComponent(SearchToolbarComponent);
    fixture.detectChanges();

    const emitted: SearchToolbarEvent[] = [];
    fixture.componentInstance.searched.subscribe((e) => emitted.push(e));
    fixture.componentInstance.runSearch();

    expect(emitted).toEqual([{ type: null, query: '' }]);
  });
});
