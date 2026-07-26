import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RailStateService {
  /** The ONLY control for rail width / header detail-view — driven by the hamburger toggle. */
  readonly expanded = signal(true);

  toggle(): void {
    this.expanded.update((v) => !v);
  }

  expand(): void {
    this.expanded.set(true);
  }
}
