import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

export interface StepDef {
  label: string;
  disabled?: boolean;
  /** Only meaningful in `linear` mode — a step beyond the active one is reachable once every step before it is marked completed. */
  completed?: boolean;
}

/**
 * Presentational/controlled, the same "value in, change event out" shape as
 * DataTable/Pagination (COMPONENT_LIBRARY_PLAN.md §13's Tier 4 notes) rather
 * than Tabs' "self-contained after mount" shape — `activeIndex` always
 * reflects the true current step, and `stepChange` is just a *request* the
 * parent can accept or ignore (e.g. WizardComponent gates it on the current
 * step's form validity, on top of the `linear` gating already enforced here).
 */
@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent {
  readonly steps = input.required<StepDef[]>();
  readonly activeIndex = input(0);
  readonly linear = input(false);
  readonly stepChange = output<number>();

  canActivate(index: number): boolean {
    const step = this.steps()[index];
    if (!step || step.disabled) {
      return false;
    }
    if (!this.linear() || index <= this.activeIndex()) {
      return true;
    }
    return this.steps()
      .slice(0, index)
      .every((s) => s.completed);
  }

  select(index: number): void {
    if (index !== this.activeIndex() && this.canActivate(index)) {
      this.stepChange.emit(index);
    }
  }
}
