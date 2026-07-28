import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardComponent } from '../../../shared/workflow/wizard/wizard.component';
import { WizardStepComponent } from '../../../shared/workflow/wizard/wizard-step.component';
import { TextboxComponent } from '../../../shared/form/textbox/textbox.component';
import { TextareaComponent } from '../../../shared/form/textarea/textarea.component';
import { DropdownComponent, DropdownOption } from '../../../shared/form/dropdown/dropdown.component';
import { DatePickerComponent } from '../../../shared/form/date-picker/date-picker.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/form/radio-group/radio-group.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { DocumentListComponent, DocumentListItem } from '../../../shared/media/document-list/document-list.component';
import { PillComponent, PillTone } from '../../../shared/feedback/pill/pill.component';
import { ToastService } from '../../../shared/toast/toast.service';
import { formatDate } from '../../../shared/form/date-utils';
import { KycCaseService } from '../kyc-case.service';
import {
  ENTITY_TYPE_OPTIONS,
  KycCaseDraft,
  KycDocument,
  KycEntityType,
  RISK_LEVEL_OPTIONS,
  RiskLevel
} from '../kyc-case.model';

const DOCUMENT_TYPE_OPTIONS: DropdownOption<string>[] = [
  { label: 'National ID', value: 'National ID' },
  { label: 'Passport', value: 'Passport' },
  { label: 'Trade License', value: 'Trade License' },
  { label: 'Utility Bill', value: 'Utility Bill' },
  { label: 'Other', value: 'Other' }
];

const RISK_TONE: Record<RiskLevel, PillTone> = {
  low: 'success',
  medium: 'amber',
  high: 'red'
};

let nextTempDocId = -1;

@Component({
  selector: 'app-kyc-intake',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    WizardComponent,
    WizardStepComponent,
    TextboxComponent,
    TextareaComponent,
    DropdownComponent,
    DatePickerComponent,
    RadioGroupComponent,
    IconComponent,
    DocumentListComponent,
    PillComponent
  ],
  templateUrl: './kyc-intake.component.html',
  styleUrl: './kyc-intake.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KycIntakeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly kycCaseService = inject(KycCaseService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Bound via `withComponentInputBinding()` from the `:id` route param — present only on `/kyc/:id/edit`. */
  readonly id = input<string>();

  protected readonly entityTypeOptions = ENTITY_TYPE_OPTIONS satisfies RadioOption<KycEntityType>[];
  protected readonly riskLevelOptions = RISK_LEVEL_OPTIONS satisfies RadioOption<RiskLevel>[];
  protected readonly documentTypeOptions = DOCUMENT_TYPE_OPTIONS;
  protected readonly riskTone = RISK_TONE;
  protected readonly saving = signal(false);
  protected readonly today = new Date();

  protected readonly step1Form = this.fb.nonNullable.group({
    entityType: this.fb.nonNullable.control<KycEntityType>('individual'),
    fullName: [''],
    nationalId: [''],
    dateOfBirth: this.fb.control<Date | null>(null),
    nationality: [''],
    businessName: [''],
    registrationNumber: [''],
    tradeLicenseNumber: [''],
    ownerName: [''],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]],
    address: ['', Validators.required]
  });

  private readonly entityType = toSignal(this.step1Form.controls.entityType.valueChanges, {
    initialValue: this.step1Form.controls.entityType.value
  });
  protected readonly isIndividual = computed(() => this.entityType() === 'individual');

  /** Only documents added during this wizard session — an existing case's already-persisted documents are shown on the detail page, not re-editable here (the service has no document-removal endpoint). */
  protected readonly newDocuments = signal<DocumentListItem[]>([]);
  private readonly newDocumentRecords = signal<KycDocument[]>([]);
  protected readonly newDocumentType = signal<string>(DOCUMENT_TYPE_OPTIONS[0].value);
  protected readonly documentsControl = new FormControl<DocumentListItem[]>([], { nonNullable: true });

  protected readonly riskControl = new FormControl<RiskLevel | null>(null, { validators: Validators.required });

  protected readonly formatDate = formatDate;

  constructor() {
    effect(() => this.applyEntityValidators(this.entityType()));

    effect(() => {
      const docs = this.newDocuments();
      const requireAtLeastOne = !this.id();
      this.documentsControl.setValue(docs, { emitEvent: false });
      this.documentsControl.setErrors(requireAtLeastOne && docs.length === 0 ? { required: true } : null);
    });

    effect(() => {
      const idParam = this.id();
      if (!idParam) {
        return;
      }
      const existing = this.kycCaseService.getById(Number(idParam));
      if (!existing) {
        this.toast.error('Case not found.');
        this.router.navigateByUrl('/kyc/list');
        return;
      }
      this.step1Form.patchValue({
        entityType: existing.entityType,
        fullName: existing.individual?.fullName ?? '',
        nationalId: existing.individual?.nationalId ?? '',
        dateOfBirth: existing.individual?.dateOfBirth ? parseDateOnly(existing.individual.dateOfBirth) : null,
        nationality: existing.individual?.nationality ?? '',
        businessName: existing.business?.businessName ?? '',
        registrationNumber: existing.business?.registrationNumber ?? '',
        tradeLicenseNumber: existing.business?.tradeLicenseNumber ?? '',
        ownerName: existing.business?.ownerName ?? '',
        email: existing.email,
        mobile: existing.mobile,
        address: existing.address
      });
      this.riskControl.setValue(existing.riskLevel);
    });
  }

  private applyEntityValidators(type: KycEntityType): void {
    const individualControls = [
      this.step1Form.controls.fullName,
      this.step1Form.controls.nationalId,
      this.step1Form.controls.dateOfBirth,
      this.step1Form.controls.nationality
    ];
    const businessControls = [
      this.step1Form.controls.businessName,
      this.step1Form.controls.registrationNumber,
      this.step1Form.controls.tradeLicenseNumber,
      this.step1Form.controls.ownerName
    ];
    const [active, inactive] = type === 'individual' ? [individualControls, businessControls] : [businessControls, individualControls];
    active.forEach((control) => {
      control.setValidators(Validators.required);
      control.updateValueAndValidity({ emitEvent: false });
    });
    inactive.forEach((control) => {
      control.clearValidators();
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  onDocumentTypeChange(type: string | null): void {
    this.newDocumentType.set(type ?? DOCUMENT_TYPE_OPTIONS[0].value);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const id = nextTempDocId--;
      const record: KycDocument = {
        id,
        type: this.newDocumentType(),
        fileName: file.name,
        url: reader.result as string,
        mimeType: file.type,
        uploadedAt: new Date().toISOString()
      };
      this.newDocumentRecords.update((docs) => [...docs, record]);
      this.newDocuments.update((docs) => [
        ...docs,
        { id, name: `${record.type} — ${record.fileName}`, status: 'pending', thumbnail: record.mimeType.startsWith('image/') ? record.url : undefined, mimeType: record.mimeType }
      ]);
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  removeDocument(item: DocumentListItem): void {
    this.newDocuments.update((docs) => docs.filter((d) => d.id !== item.id));
    this.newDocumentRecords.update((docs) => docs.filter((d) => d.id !== item.id));
  }

  finish(): void {
    const draft = this.buildDraft();
    const existingId = this.id() ? Number(this.id()) : null;
    this.saving.set(true);

    const request = existingId ? this.kycCaseService.update(existingId, draft) : this.kycCaseService.create(draft);
    request.subscribe({
      next: (record) => {
        if (existingId) {
          this.kycCaseService.commitUpdate(record);
        } else {
          this.kycCaseService.commitCreate(record);
        }
        this.persistNewDocuments(record.id, this.newDocumentRecords(), () => {
          this.saving.set(false);
          this.toast.success(existingId ? 'Case updated.' : 'Case created.');
          this.router.navigateByUrl(`/kyc/${record.id}`);
        });
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.toast.error(err.message || 'Something went wrong. Please try again.');
      }
    });
  }

  private persistNewDocuments(caseId: number, docs: KycDocument[], onDone: () => void): void {
    if (docs.length === 0) {
      onDone();
      return;
    }
    const [doc, ...rest] = docs;
    this.kycCaseService.addDocument(caseId, { type: doc.type, fileName: doc.fileName, url: doc.url, mimeType: doc.mimeType }).subscribe({
      next: (record) => {
        this.kycCaseService.commitAddDocument(record);
        this.persistNewDocuments(caseId, rest, onDone);
      },
      error: () => {
        this.toast.error('Some documents failed to upload.');
        onDone();
      }
    });
  }

  private buildDraft(): KycCaseDraft {
    const raw = this.step1Form.getRawValue();
    const entityType = raw.entityType;
    return {
      entityType,
      individual:
        entityType === 'individual'
          ? {
              fullName: raw.fullName,
              nationalId: raw.nationalId,
              dateOfBirth: raw.dateOfBirth ? toDateOnlyString(raw.dateOfBirth) : '',
              nationality: raw.nationality
            }
          : null,
      business:
        entityType === 'business'
          ? {
              businessName: raw.businessName,
              registrationNumber: raw.registrationNumber,
              tradeLicenseNumber: raw.tradeLicenseNumber,
              ownerName: raw.ownerName
            }
          : null,
      email: raw.email,
      mobile: raw.mobile,
      address: raw.address,
      riskLevel: (this.riskControl.value ?? 'low') as RiskLevel
    };
  }
}

/** Local-date (not UTC) `YYYY-MM-DD` formatting — `Date#toISOString()` would shift the day backward for negative UTC offsets. */
function toDateOnlyString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Inverse of `toDateOnlyString` — `new Date('YYYY-MM-DD')` parses as UTC midnight, which is the wrong local day in negative UTC offsets. */
function parseDateOnly(s: string): Date {
  const [year, month, day] = s.split('-').map(Number);
  return new Date(year, month - 1, day);
}
