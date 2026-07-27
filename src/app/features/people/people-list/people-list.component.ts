import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { ConfirmDialogComponent } from '../../../shared/feedback/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { ButtonDirective } from '../../../shared/form/button/button.directive';
import { ColumnDef, DataTableComponent, SortState } from '../../../shared/data/data-table/data-table.component';
import { FilterBarComponent } from '../../../shared/data/filter-bar/filter-bar.component';
import { SearchToolbarEvent, SearchTypeOption } from '../../../shared/data/search-toolbar/search-toolbar.component';
import { ExportButtonComponent } from '../../../shared/data/export-button/export-button.component';
import { ExportColumn } from '../../../shared/data/export-button/export-strategy';
import { PeopleService } from '../people.service';
import { Person, PersonDraft } from '../people.model';
import { PersonFormComponent } from '../person-form/person-form.component';

const SEARCH_TYPES: SearchTypeOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' }
];

const PAGE_SIZE = 10;

@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [
    IconComponent,
    ModalComponent,
    ConfirmDialogComponent,
    PersonFormComponent,
    ButtonDirective,
    DataTableComponent,
    FilterBarComponent,
    ExportButtonComponent
  ],
  templateUrl: './people-list.component.html',
  styleUrl: './people-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeopleListComponent {
  private readonly peopleService = inject(PeopleService);
  private readonly toast = inject(ToastService);

  protected readonly searchTypes = SEARCH_TYPES;
  protected readonly pageSize = PAGE_SIZE;

  /** Referenced from people-list.component.html — `<ng-template>`s can only be grabbed via a view query, since `columns` is built here in the class, not inline in the template. */
  private readonly photoCellTpl = viewChild<TemplateRef<{ $implicit: Person }>>('photoCell');
  private readonly nameCellTpl = viewChild<TemplateRef<{ $implicit: Person }>>('nameCell');
  private readonly actionsCellTpl = viewChild<TemplateRef<{ $implicit: Person }>>('actionsCell');

  protected readonly columns = computed<ColumnDef<Person>[]>(() => [
    { key: 'photoUrl', header: 'Photo', cellTemplate: this.photoCellTpl() },
    { key: 'firstName', header: 'Name', sortable: true, cellTemplate: this.nameCellTpl() },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'mobile', header: 'Mobile' },
    { key: 'gender', header: 'Gender' },
    { key: 'education', header: 'Education' },
    { key: 'actions', header: '', align: 'end', cellTemplate: this.actionsCellTpl() }
  ]);

  protected readonly exportColumns: ExportColumn<Person>[] = [
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'email', header: 'Email' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'gender', header: 'Gender' },
    { key: 'education', header: 'Education' }
  ];

  private readonly searchType = signal<string | null>(null);
  private readonly searchQuery = signal('');
  protected readonly sort = signal<SortState | null>(null);
  protected readonly page = signal(1);

  private readonly filtered = computed(() => {
    const type = this.searchType();
    const query = this.searchQuery().trim().toLowerCase();
    const all = this.peopleService.list();
    if (!query) {
      return all;
    }
    return all.filter((p) => {
      if (type === 'email') {
        return p.email.toLowerCase().includes(query);
      }
      return `${p.firstName} ${p.lastName}`.toLowerCase().includes(query);
    });
  });

  private readonly sorted = computed(() => {
    const sort = this.sort();
    if (!sort || sort.direction === 'none') {
      return this.filtered();
    }
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...this.filtered()].sort((a, b) => {
      const av = String(a[sort.key as keyof Person] ?? '');
      const bv = String(b[sort.key as keyof Person] ?? '');
      return av.localeCompare(bv) * dir;
    });
  });

  protected readonly total = computed(() => this.sorted().length);

  protected readonly pageRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Person | null>(null);
  protected readonly saving = signal(false);

  protected readonly pendingDelete = signal<Person | null>(null);
  protected readonly deleting = signal(false);

  onSearch(event: SearchToolbarEvent): void {
    this.searchType.set(event.type);
    this.searchQuery.set(event.query);
    this.page.set(1);
  }

  onSortChange(sort: SortState): void {
    this.sort.set(sort);
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

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
