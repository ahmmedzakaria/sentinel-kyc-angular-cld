import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { IconComponent } from '../../icon/icon.component';
import { BaseValueAccessor } from '../base-value-accessor';
import { DropdownOption } from '../dropdown/dropdown.component';

export interface DropdownPage<T> {
  items: DropdownOption<T>[];
  hasMore: boolean;
}

/** How close to the bottom (in px) of the panel before the next page loads. */
const SCROLL_THRESHOLD_PX = 48;

@Component({
  selector: 'app-dropdown-async-scrollable',
  standalone: true,
  imports: [OverlayModule, IconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: DropdownAsyncScrollableComponent, multi: true }],
  templateUrl: './dropdown-async-scrollable.component.html',
  styleUrl: './dropdown-async-scrollable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownAsyncScrollableComponent<T = string> extends BaseValueAccessor<T> {
  readonly loadPage = input.required<(query: string, page: number) => Observable<DropdownPage<T>>>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select…');
  readonly searchPlaceholder = input<string>('Search…');
  readonly errorMessage = input<string | null>(null);
  readonly debounceMs = input<number>(300);
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);
  readonly initialOption = input<DropdownOption<T> | null>(null);

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly loading = signal(false);
  protected readonly loadingMore = signal(false);
  protected readonly options = signal<DropdownOption<T>[]>([]);
  protected readonly page = signal(0);
  protected readonly hasMore = signal(true);
  protected readonly activeIndex = signal(-1);
  protected readonly selectedLabel = signal<string | null>(null);

  private readonly search$ = new Subject<string>();

  constructor() {
    super();

    effect(() => {
      const init = this.initialOption();
      const value = this.value();
      if (init && value !== null && this.compareWith()(init.value, value)) {
        this.selectedLabel.set(init.label);
      }
    });

    this.search$
      .pipe(
        debounceTime(this.debounceMs()),
        distinctUntilChanged(),
        switchMap((q) => {
          this.loading.set(true);
          this.page.set(0);
          try {
            return this.loadPage()(q, 0).pipe(catchError(() => of<DropdownPage<T>>({ items: [], hasMore: false })));
          } catch {
            return of<DropdownPage<T>>({ items: [], hasMore: false });
          }
        }),
        takeUntilDestroyed()
      )
      .subscribe((result) => {
        this.options.set(result.items);
        this.hasMore.set(result.hasMore);
        this.loading.set(false);
        this.activeIndex.set(result.items.length ? 0 : -1);
      });
  }

  toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.open.update((v) => !v);
    if (this.open()) {
      this.query.set('');
      this.search$.next('');
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

  onQueryInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.query.set(q);
    this.search$.next(q);
  }

  onPanelScroll(event: Event): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) {
      return;
    }
    const el = event.target as HTMLElement;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom <= SCROLL_THRESHOLD_PX) {
      this.loadNextPage();
    }
  }

  private loadNextPage(): void {
    const nextPage = this.page() + 1;
    this.loadingMore.set(true);
    let request: Observable<DropdownPage<T>>;
    try {
      request = this.loadPage()(this.query(), nextPage);
    } catch {
      request = of<DropdownPage<T>>({ items: [], hasMore: false });
    }
    request.pipe(catchError(() => of<DropdownPage<T>>({ items: [], hasMore: false }))).subscribe((result) => {
      this.options.update((list) => [...list, ...result.items]);
      this.hasMore.set(result.hasMore);
      this.page.set(nextPage);
      this.loadingMore.set(false);
    });
  }

  selectOption(option: DropdownOption<T>): void {
    if (option.disabled) {
      return;
    }
    this.emitValue(option.value);
    this.selectedLabel.set(option.label);
    this.close();
  }

  protected readonly triggerLabel = computed(() => this.selectedLabel() ?? this.placeholder());
}
