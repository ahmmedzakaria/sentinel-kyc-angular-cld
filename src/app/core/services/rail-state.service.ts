import { Injectable, signal } from '@angular/core';

const DESKTOP_BREAKPOINT_PX = 1024;

@Injectable({ providedIn: 'root' })
export class RailStateService {
  /**
   * The ONLY control for rail width / header detail-view — driven by the
   * hamburger toggle. Below desktop this doubles as "is the off-canvas
   * drawer open", so it must default to closed there — starting it `true`
   * unconditionally would open a full-screen drawer over the dashboard the
   * instant a phone loads the app.
   */
  readonly expanded = signal(typeof window !== 'undefined' ? window.innerWidth >= DESKTOP_BREAKPOINT_PX : true);

  toggle(): void {
    this.expanded.update((v) => !v);
  }

  expand(): void {
    this.expanded.set(true);
  }

  /** Closes the mobile/tablet off-canvas drawer (backdrop click, Escape). */
  collapse(): void {
    this.expanded.set(false);
  }
}
