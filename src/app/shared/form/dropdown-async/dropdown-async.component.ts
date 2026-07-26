import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { IconComponent } from '../../icon/icon.component';
import { BaseValueAccessor } from '../base-value-accessor';
import { DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-dropdown-async',
  standalone: true,
  imports: [OverlayModule, IconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: DropdownAsyncComponent, multi: true }],
  templateUrl: './dropdown-async.component.html',
  styleUrl: './dropdown-async.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownAsyncComponent<T = string> extends BaseValueAccessor<T> {
  readonly loadOptions = input.required<(query: string) => Observable<DropdownOption<T>[]>>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select…');
  readonly searchPlaceholder = input<string>('Search…');
  readonly errorMessage = input<string | null>(null);
  readonly debounceMs = input<number>(300);
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);
  /** Known label for the current value at load time (e.g. editing a record) — avoids an unnecessary fetch just to display it. */
  readonly initialOption = input<DropdownOption<T> | null>(null);

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly loading = signal(false);
  protected readonly options = signal<DropdownOption<T>[]>([]);
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
          try {
            return this.loadOptions()(q).pipe(catchError(() => of([])));
          } catch {
            return of([]);
          }
        }),
        takeUntilDestroyed()
      )
      .subscribe((opts) => {
        this.options.set(opts);
        this.loading.set(false);
        this.activeIndex.set(opts.length ? 0 : -1);
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

  selectOption(option: DropdownOption<T>): void {
    if (option.disabled) {
      return;
    }
    this.emitValue(option.value);
    this.selectedLabel.set(option.label);
    this.close();
  }

  protected readonly triggerLabel = computed(() => this.selectedLabel() ?? this.placeholder());

  onListKeydown(event: KeyboardEvent): void {
    const opts = this.options();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0 && opts[this.activeIndex()]) {
          this.selectOption(opts[this.activeIndex()]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  private moveActive(delta: number): void {
    const opts = this.options();
    if (!opts.length) {
      return;
    }
    let next = this.activeIndex();
    for (let i = 0; i < opts.length; i++) {
      next = (next + delta + opts.length) % opts.length;
      if (!opts[next].disabled) {
        break;
      }
    }
    this.activeIndex.set(next);
  }
}
