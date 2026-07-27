import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StepDef, StepperComponent } from './stepper.component';

function create(steps: StepDef[], activeIndex: number, linear: boolean) {
  const fixture = TestBed.createComponent(StepperComponent);
  fixture.componentRef.setInput('steps', steps);
  fixture.componentRef.setInput('activeIndex', activeIndex);
  fixture.componentRef.setInput('linear', linear);
  fixture.detectChanges();
  return fixture;
}

describe('StepperComponent', () => {
  it('non-linear mode allows activating any enabled step, forward or backward', () => {
    const fixture = create([{ label: 'A' }, { label: 'B' }, { label: 'C' }], 0, false);
    expect(fixture.componentInstance.canActivate(2)).toBe(true);
    expect(fixture.componentInstance.canActivate(0)).toBe(true);
  });

  it('a disabled step can never be activated, linear or not', () => {
    const fixture = create([{ label: 'A' }, { label: 'B', disabled: true }, { label: 'C' }], 0, false);
    expect(fixture.componentInstance.canActivate(1)).toBe(false);
  });

  it('linear mode blocks skipping ahead of the first incomplete step', () => {
    const fixture = create([{ label: 'A', completed: true }, { label: 'B' }, { label: 'C' }], 0, true);
    // Step 1 (B) is reachable — everything before it is completed.
    expect(fixture.componentInstance.canActivate(1)).toBe(true);
    // Step 2 (C) is not — step 1 (B) isn't completed yet.
    expect(fixture.componentInstance.canActivate(2)).toBe(false);
  });

  it('linear mode always allows going back to an earlier step', () => {
    const fixture = create([{ label: 'A', completed: true }, { label: 'B', completed: true }, { label: 'C' }], 2, true);
    expect(fixture.componentInstance.canActivate(0)).toBe(true);
    expect(fixture.componentInstance.canActivate(1)).toBe(true);
  });

  it('linear mode allows advancing once every prior step is completed', () => {
    const fixture = create([{ label: 'A', completed: true }, { label: 'B', completed: true }, { label: 'C' }], 1, true);
    expect(fixture.componentInstance.canActivate(2)).toBe(true);
  });

  it('select() emits stepChange only for a reachable, different step', () => {
    const fixture = create([{ label: 'A', completed: true }, { label: 'B' }, { label: 'C' }], 0, true);
    const emitted: number[] = [];
    fixture.componentInstance.stepChange.subscribe((i) => emitted.push(i));

    fixture.componentInstance.select(0); // same as active — no-op
    fixture.componentInstance.select(2); // unreachable in linear mode — no-op
    fixture.componentInstance.select(1); // reachable — emits

    expect(emitted).toEqual([1]);
  });
});
