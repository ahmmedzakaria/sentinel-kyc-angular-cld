import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvatarUploadComponent } from '../../../shared/avatar-upload/avatar-upload.component';
import { ButtonDirective } from '../../../shared/form/button/button.directive';
import { DropdownComponent, DropdownOption } from '../../../shared/form/dropdown/dropdown.component';
import { TextboxComponent } from '../../../shared/form/textbox/textbox.component';
import { EDUCATION_OPTIONS, Education, GENDER_OPTIONS, Gender, Person, PersonDraft } from '../people.model';

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [ReactiveFormsModule, AvatarUploadComponent, ButtonDirective, DropdownComponent, TextboxComponent],
  templateUrl: './person-form.component.html',
  styleUrl: './person-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonFormComponent {
  private readonly fb = inject(FormBuilder);

  /** null = create mode; a Person = edit mode, form is pre-filled. */
  readonly person = input<Person | null>(null);
  readonly submitting = input<boolean>(false);

  readonly save = output<PersonDraft>();
  readonly cancel = output<void>();

  protected readonly genderOptions: DropdownOption<Gender>[] = GENDER_OPTIONS.map((g) => ({ label: g, value: g }));
  protected readonly educationOptions: DropdownOption<Education>[] = EDUCATION_OPTIONS.map((e) => ({ label: e, value: e }));

  protected readonly form = this.fb.nonNullable.group({
    photoUrl: this.fb.control<string | null>(null),
    firstName: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]],
    gender: this.fb.nonNullable.control(GENDER_OPTIONS[0]),
    education: this.fb.nonNullable.control(EDUCATION_OPTIONS[1])
  });

  constructor() {
    effect(() => {
      const p = this.person();
      this.form.reset(
        p ?? {
          photoUrl: null,
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          gender: GENDER_OPTIONS[0],
          education: EDUCATION_OPTIONS[1]
        }
      );
    });
  }

  onPhotoChange(url: string | null): void {
    this.form.controls.photoUrl.setValue(url);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }
}
