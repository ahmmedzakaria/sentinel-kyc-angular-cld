import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { SearchToolbarComponent, SearchToolbarEvent, SearchTypeOption } from '../search-toolbar/search-toolbar.component';

/** A single active-filter chip rendered below the search row — the consumer owns computing this list from its own filter controls' state. */
export interface FilterChip {
  key: string;
  label: string;
}

/**
 * A row of filters above a DataTable: composes SearchToolbar (search
 * type/query) with a content-projection slot for arbitrary extra filter
 * controls (Dropdown, DateRangePicker, StatusBadge toggle chips, etc.) that
 * the consumer supplies. FilterBar doesn't reach into those projected
 * controls' internals — it surfaces the *combined* filter state as three
 * events instead: the search toolbar's own `searched`, a `chipRemoved` for an
 * individual active-filter chip's "x", and `cleared` for "Clear all". The
 * consumer maps its own filter-control state into the `chips` input so the
 * active filters are visible as removable tags regardless of which controls
 * produced them.
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [IconComponent, SearchToolbarComponent],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarComponent {
  readonly searchTypes = input<SearchTypeOption[]>([]);
  readonly placeholder = input('Search…');
  readonly chips = input<FilterChip[]>([]);

  /** Named `searched`, not `search` — an output literally named `search` collides with the native DOM `search` event. */
  readonly searched = output<SearchToolbarEvent>();
  readonly chipRemoved = output<string>();
  readonly cleared = output<void>();

  onSearch(event: SearchToolbarEvent): void {
    this.searched.emit(event);
  }

  removeChip(key: string): void {
    this.chipRemoved.emit(key);
  }

  clearAll(): void {
    this.cleared.emit();
  }
}
