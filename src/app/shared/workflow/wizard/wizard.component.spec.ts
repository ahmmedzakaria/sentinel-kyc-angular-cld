import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { WizardComponent } from './wizard.component';
import { WizardStepComponent } from './wizard-step.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, WizardComponent, WizardStepComponent],
  template: `
    <app-wizard (finished)="onFinished()" (stepIndexChange)="lastIndex = $event">
      <app-wizard-step label="Details" [form]="detailsForm">
        <input [formControl]="detailsForm" />
      </app-wizard-step>
      <app-wizard-step label="Review">Review content</app-wizard-step>
    </app-wizard>
  `
})
class HostComponent {
  readonly detailsForm = new FormControl('', { nonNullable: true, validators: Validators.required });
  lastIndex: number | null = null;
  finishedCount = 0;

  onFinished(): void {
    this.finishedCount++;
  }
}

function nextButton(fixture: ComponentFixture<HostComponent>): HTMLButtonElement {
  return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.wizard-actions button')).find(
    (b) => b.textContent?.trim() === 'Next' || b.textContent?.trim() === 'Finish'
  )!;
}

describe('WizardComponent', () => {
  it('shows only the first step initially', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const steps: HTMLElement[] = fixture.nativeElement.querySelectorAll('app-wizard-step');
    expect(steps[0].style.display).not.toBe('none');
    expect(steps[1].style.display).toBe('none');
  });

  it('blocks Next while the active step\'s form is invalid', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(nextButton(fixture).disabled).toBe(true);

    fixture.componentInstance.detailsForm.setValue('Jane Doe');
    fixture.detectChanges();

    expect(nextButton(fixture).disabled).toBe(false);
  });

  it('advances to the next step once the form becomes valid', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.detailsForm.setValue('Jane Doe');
    fixture.detectChanges();
    nextButton(fixture).click();
    fixture.detectChanges();

    const steps: HTMLElement[] = fixture.nativeElement.querySelectorAll('app-wizard-step');
    expect(steps[0].style.display).toBe('none');
    expect(steps[1].style.display).not.toBe('none');
    expect(fixture.componentInstance.lastIndex).toBe(1);
  });

  it('emits finished when Next/Finish is clicked on the last step', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.detailsForm.setValue('Jane Doe');
    fixture.detectChanges();
    nextButton(fixture).click(); // -> step 2 (Review, no form)
    fixture.detectChanges();

    expect(nextButton(fixture).textContent?.trim()).toBe('Finish');
    nextButton(fixture).click();

    expect(fixture.componentInstance.finishedCount).toBe(1);
  });

  it('Back is disabled on the first step and re-enabled after advancing', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const backBtn = () =>
      Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.wizard-actions button')).find(
        (b) => b.textContent?.trim() === 'Back'
      )!;
    expect(backBtn().disabled).toBe(true);

    fixture.componentInstance.detailsForm.setValue('Jane Doe');
    fixture.detectChanges();
    nextButton(fixture).click();
    fixture.detectChanges();

    expect(backBtn().disabled).toBe(false);
  });
});
