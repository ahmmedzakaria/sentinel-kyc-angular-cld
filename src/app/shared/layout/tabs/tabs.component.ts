import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  contentChildren,
  effect,
  input,
  output,
  signal,
  viewChildren
} from '@angular/core';
import { TabComponent } from './tab.component';

let nextUid = 0;

/**
 * ARIA tabs pattern (see COMPONENT_LIBRARY_PLAN.md §8): role="tablist"/"tab"/
 * "tabpanel", arrow-key switching with automatic activation, Home/End jump to
 * the first/last enabled tab, and a roving tabindex so only the active tab
 * sits in the natural Tab order — disabled tabs are skipped by all
 * navigation, not just visually greyed out.
 *
 * `activeIndex` sets which tab starts active; after mount, `select()`/keyboard
 * navigation is the source of truth (not a two-way-bound input) — the same
 * "controlled by events after mount" shape as a native <details> element.
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  readonly activeIndex = input(0);
  readonly activeIndexChange = output<number>();

  protected readonly tabs = contentChildren(TabComponent, { descendants: true });
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  protected readonly uid = `tabs-${nextUid++}`;
  protected readonly currentIndex = signal(0);
  private initialized = false;

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      if (!tabs.length) {
        return;
      }
      if (!this.initialized) {
        this.initialized = true;
        this.currentIndex.set(this.activeIndex());
      }
      const idx = this.currentIndex();
      tabs.forEach((tab, i) => {
        tab.setActive(i === idx);
        tab.setTabButtonId(`${this.uid}-tab-${i}`);
      });
    });
  }

  select(index: number): void {
    const tab = this.tabs()[index];
    if (!tab || tab.disabled()) {
      return;
    }
    this.currentIndex.set(index);
    this.activeIndexChange.emit(index);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const tabs = this.tabs();
    if (!tabs.length) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.focusAndSelect(this.nextEnabledIndex(index, 1));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusAndSelect(this.nextEnabledIndex(index, -1));
        break;
      case 'Home':
        event.preventDefault();
        this.focusAndSelect(this.nextEnabledIndex(-1, 1));
        break;
      case 'End':
        event.preventDefault();
        this.focusAndSelect(this.nextEnabledIndex(tabs.length, -1));
        break;
    }
  }

  private nextEnabledIndex(from: number, delta: number): number {
    const tabs = this.tabs();
    let next = from;
    for (let i = 0; i < tabs.length; i++) {
      next = (next + delta + tabs.length) % tabs.length;
      if (!tabs[next].disabled()) {
        return next;
      }
    }
    return from;
  }

  private focusAndSelect(index: number): void {
    this.select(index);
    this.tabButtons()[index]?.nativeElement.focus();
  }
}
