import { Directive, HostBinding, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';

/**
 * Applies Sentinel KYC's button styling to a native <button>, instead of
 * wrapping it in a component — a button is ~90% styling plus a
 * loading/disabled state, with no internal markup worth owning separately
 * (see COMPONENT_LIBRARY_PLAN.md §7/§13 for the reasoning).
 *
 * This directive is purely visual — it does NOT bind the native `disabled`
 * attribute itself, since a consumer's own `[disabled]="form.invalid"` on the
 * same element would collide with it (Angular's NG0500 "multiple bindings to
 * the same host property" error). Combine them yourself:
 *
 *   <button appButton [loading]="saving()" [disabled]="saving() || form.invalid">Save</button>
 */
@Directive({
  selector: 'button[appButton]',
  standalone: true
})
export class ButtonDirective {
  readonly variant = input<ButtonVariant>('primary');
  readonly loading = input(false);

  @HostBinding('class.btn') readonly baseClass = true;
  @HostBinding('class.btn-primary') get isPrimary(): boolean {
    return this.variant() === 'primary';
  }
  @HostBinding('class.btn-ghost') get isGhost(): boolean {
    return this.variant() === 'ghost';
  }
  @HostBinding('class.btn-danger') get isDanger(): boolean {
    return this.variant() === 'danger';
  }
  @HostBinding('class.btn-loading') get isLoading(): boolean {
    return this.loading();
  }
  @HostBinding('attr.aria-busy') get ariaBusy(): boolean | null {
    return this.loading() || null;
  }
}
