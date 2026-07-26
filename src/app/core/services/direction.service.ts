import { Injectable, effect, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';

const RTL_LANGS = new Set(['ar']);

@Injectable({ providedIn: 'root' })
export class DirectionService {
  private readonly transloco = inject(TranslocoService);
  private readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang()
  });

  constructor() {
    // Logical-property CSS (margin-inline-start, etc.) throughout the app means
    // flipping this attribute is enough to mirror the rail, flyout, and header.
    effect(() => {
      const dir = RTL_LANGS.has(this.activeLang()) ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', this.activeLang());
    });
  }
}
