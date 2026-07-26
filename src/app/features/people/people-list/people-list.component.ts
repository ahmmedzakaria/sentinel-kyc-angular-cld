import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { ConfirmDialogComponent } from '../../../shared/feedback/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/feedback/empty-state/empty-state.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { ButtonDirective } from '../../../shared/form/button/button.directive';
import { PeopleService } from '../people.service';
import { Person, PersonDraft } from '../people.model';
import { PersonFormComponent } from '../person-form/person-form.component';

@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [IconComponent, ModalComponent, ConfirmDialogComponent, EmptyStateComponent, PersonFormComponent, ButtonDirective],
  templateUrl: './people-list.component.html',
  styleUrl: './people-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeopleListComponent {
  private readonly peopleService = inject(PeopleService);
  private readonly toast = inject(ToastService);

  protected readonly people = this.peopleService.list;

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Person | null>(null);
  protected readonly saving = signal(false);

  protected readonly pendingDelete = signal<Person | null>(null);
  protected readonly deleting = signal(false);

  openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  openEdit(person: Person): void {
    this.editing.set(person);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  save(draft: PersonDraft): void {
    this.saving.set(true);
    const current = this.editing();

    const request = current ? this.peopleService.update(current.id, draft) : this.peopleService.create(draft);

    request.subscribe({
      next: (record) => {
        this.saving.set(false);
        if (current) {
          this.peopleService.commitUpdate(record);
          this.toast.success(`Updated ${record.firstName} ${record.lastName}.`);
        } else {
          this.peopleService.commitCreate(record);
          this.toast.success(`Added ${record.firstName} ${record.lastName}.`);
        }
        this.closeForm();
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.toast.error(err.message || 'Something went wrong. Please try again.');
      }
    });
  }

  confirmDelete(person: Person): void {
    this.pendingDelete.set(person);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  performDelete(): void {
    const person = this.pendingDelete();
    if (!person) {
      return;
    }
    this.deleting.set(true);
    this.peopleService.delete(person.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.peopleService.commitDelete(person.id);
        this.pendingDelete.set(null);
        this.toast.info(`Removed ${person.firstName} ${person.lastName}.`);
      },
      error: () => {
        this.deleting.set(false);
        this.toast.error('Could not delete this record. Please try again.');
      }
    });
  }
}
