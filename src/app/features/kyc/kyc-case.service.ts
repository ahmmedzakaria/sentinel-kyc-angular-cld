import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { ApprovalDecision } from '../../shared/workflow/approval-actions/approval-actions.component';
import { EMPTY_DRAFT, KycCase, KycCaseDraft, KycDocument } from './kyc-case.model';

const SEED: KycCase[] = [
  {
    id: 1,
    entityType: 'individual',
    individual: { fullName: 'Farhan Rahman', nationalId: 'NID-9012345678', dateOfBirth: '1990-04-12', nationality: 'Bangladeshi' },
    business: null,
    email: 'farhan.rahman@example.com',
    mobile: '+880 1711 445566',
    address: 'House 12, Road 5, Banani, Dhaka',
    riskLevel: 'low',
    status: 'pending',
    documents: [
      { id: 1, type: 'National ID', fileName: 'nid-front.jpg', url: '', mimeType: 'image/jpeg', uploadedAt: '2026-07-10T09:15:00.000Z' }
    ],
    activity: [{ id: 1, label: 'Case created', actor: 'System', timestamp: '2026-07-10T09:15:00.000Z' }],
    createdAt: '2026-07-10T09:15:00.000Z',
    updatedAt: '2026-07-10T09:15:00.000Z'
  },
  {
    id: 2,
    entityType: 'business',
    individual: null,
    business: {
      businessName: 'Novatrade Ltd.',
      registrationNumber: 'REG-778899',
      tradeLicenseNumber: 'TL-2026-0451',
      ownerName: 'Shamima Akter'
    },
    email: 'compliance@novatrade.example',
    mobile: '+880 1711 778899',
    address: 'Level 6, Baymans Galleria, Gulshan, Dhaka',
    riskLevel: 'medium',
    status: 'approved',
    documents: [
      { id: 2, type: 'Trade License', fileName: 'trade-license.pdf', url: '', mimeType: 'application/pdf', uploadedAt: '2026-06-02T11:00:00.000Z' }
    ],
    activity: [
      { id: 1, label: 'Case created', actor: 'System', timestamp: '2026-06-02T11:00:00.000Z' },
      { id: 2, label: 'Approved', actor: 'Compliance Officer', timestamp: '2026-06-05T14:30:00.000Z' }
    ],
    createdAt: '2026-06-02T11:00:00.000Z',
    updatedAt: '2026-06-05T14:30:00.000Z'
  },
  {
    id: 3,
    entityType: 'individual',
    individual: { fullName: 'Tasnim Chowdhury', nationalId: 'NID-3344556677', dateOfBirth: '1985-11-02', nationality: 'Bangladeshi' },
    business: null,
    email: 'tasnim.chowdhury@example.com',
    mobile: '+880 1711 112233',
    address: 'Flat 4B, Road 11, Dhanmondi, Dhaka',
    riskLevel: 'high',
    status: 'rejected',
    documents: [],
    activity: [
      { id: 1, label: 'Case created', actor: 'System', timestamp: '2026-05-20T08:00:00.000Z' },
      { id: 2, label: 'Rejected', actor: 'Compliance Officer', timestamp: '2026-05-22T10:45:00.000Z' }
    ],
    createdAt: '2026-05-20T08:00:00.000Z',
    updatedAt: '2026-05-22T10:45:00.000Z'
  },
  {
    id: 4,
    entityType: 'business',
    individual: null,
    business: {
      businessName: 'Blue Horizon Traders',
      registrationNumber: 'REG-112233',
      tradeLicenseNumber: 'TL-2026-0198',
      ownerName: 'Kamal Hossain'
    },
    email: 'kyc@bluehorizon.example',
    mobile: '+880 1711 990011',
    address: 'Plot 22, Uttara Sector 9, Dhaka',
    riskLevel: 'medium',
    status: 'pending',
    documents: [],
    activity: [{ id: 1, label: 'Case created', actor: 'System', timestamp: '2026-07-20T13:00:00.000Z' }],
    createdAt: '2026-07-20T13:00:00.000Z',
    updatedAt: '2026-07-20T13:00:00.000Z'
  }
];

/** Simulated network latency so loading/error states are actually visible in the POC. */
const LATENCY_MS = 350;

function decisionLabel(decision: ApprovalDecision): string {
  switch (decision.action) {
    case 'approve':
      return 'Approved';
    case 'reject':
      return `Rejected — ${decision.reason ?? ''}`;
    case 'escalate':
      return `Escalated — ${decision.reason ?? ''}`;
  }
}

function decisionStatus(action: ApprovalDecision['action']): KycCase['status'] {
  switch (action) {
    case 'approve':
      return 'approved';
    case 'reject':
      return 'rejected';
    case 'escalate':
      return 'escalated';
  }
}

@Injectable({ providedIn: 'root' })
export class KycCaseService {
  private readonly cases = signal<KycCase[]>(SEED);
  private nextId = SEED.length + 1;
  private nextActivityId = 1000;
  private nextDocumentId = 1000;

  readonly list = this.cases.asReadonly();

  emptyDraft(): KycCaseDraft {
    return { ...EMPTY_DRAFT };
  }

  getById(id: number): KycCase | undefined {
    return this.cases().find((c) => c.id === id);
  }

  create(draft: KycCaseDraft): Observable<KycCase> {
    const now = new Date().toISOString();
    const record: KycCase = {
      ...draft,
      id: this.nextId++,
      status: 'pending',
      documents: [],
      activity: [{ id: this.nextActivityId++, label: 'Case created', actor: 'Compliance Officer', timestamp: now }],
      createdAt: now,
      updatedAt: now
    };
    return of(record).pipe(delay(LATENCY_MS));
  }

  update(id: number, draft: KycCaseDraft): Observable<KycCase> {
    const existing = this.getById(id);
    const record: KycCase = {
      ...(existing as KycCase),
      ...draft,
      id,
      updatedAt: new Date().toISOString()
    };
    return of(record).pipe(delay(LATENCY_MS));
  }

  decide(id: number, decision: ApprovalDecision): Observable<KycCase> {
    const existing = this.getById(id);
    const now = new Date().toISOString();
    const record: KycCase = {
      ...(existing as KycCase),
      status: decisionStatus(decision.action),
      activity: [
        ...(existing?.activity ?? []),
        { id: this.nextActivityId++, label: decisionLabel(decision), actor: 'Compliance Officer', timestamp: now }
      ],
      updatedAt: now
    };
    return of(record).pipe(delay(LATENCY_MS));
  }

  addDocument(id: number, doc: Omit<KycDocument, 'id' | 'uploadedAt'>): Observable<KycCase> {
    const existing = this.getById(id);
    const now = new Date().toISOString();
    const document: KycDocument = { ...doc, id: this.nextDocumentId++, uploadedAt: now };
    const record: KycCase = {
      ...(existing as KycCase),
      documents: [...(existing?.documents ?? []), document],
      activity: [
        ...(existing?.activity ?? []),
        { id: this.nextActivityId++, label: `Document uploaded — ${doc.fileName}`, actor: 'Compliance Officer', timestamp: now }
      ],
      updatedAt: now
    };
    return of(record).pipe(delay(LATENCY_MS));
  }

  /** Called by callers once an Observable above resolves successfully. */
  commitCreate(record: KycCase): void {
    this.cases.update((list) => [...list, record]);
  }

  commitUpdate(record: KycCase): void {
    this.cases.update((list) => list.map((c) => (c.id === record.id ? record : c)));
  }

  commitDecide(record: KycCase): void {
    this.cases.update((list) => list.map((c) => (c.id === record.id ? record : c)));
  }

  commitAddDocument(record: KycCase): void {
    this.cases.update((list) => list.map((c) => (c.id === record.id ? record : c)));
  }
}
