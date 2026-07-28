import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { KycCaseService } from './kyc-case.service';
import { KycCaseDraft } from './kyc-case.model';

function draft(overrides: Partial<KycCaseDraft> = {}): KycCaseDraft {
  return {
    entityType: 'individual',
    individual: { fullName: 'Test Person', nationalId: 'NID-000', dateOfBirth: '2000-01-01', nationality: 'Bangladeshi' },
    business: null,
    email: 'test.person@example.com',
    mobile: '+880 1711 000000',
    address: 'Test address',
    riskLevel: 'low',
    ...overrides
  };
}

describe('KycCaseService', () => {
  it('seeds with 4 cases spanning both entity types', () => {
    const service = new KycCaseService();
    expect(service.list().length).toBe(4);
    expect(service.list().some((c) => c.entityType === 'individual')).toBe(true);
    expect(service.list().some((c) => c.entityType === 'business')).toBe(true);
  });

  it('create() resolves a pending case with a creation activity entry and does not mutate state until commitCreate()', async () => {
    const service = new KycCaseService();
    const before = service.list().length;

    const record = await firstValueFrom(service.create(draft()));
    expect(record.id).toBeGreaterThan(0);
    expect(record.status).toBe('pending');
    expect(record.activity.length).toBe(1);
    expect(service.list().length).toBe(before); // not committed yet

    service.commitCreate(record);
    expect(service.list().length).toBe(before + 1);
  });

  it('update() preserves id and merges the draft', async () => {
    const service = new KycCaseService();
    const existing = service.list()[0];

    const record = await firstValueFrom(service.update(existing.id, draft({ email: 'changed@example.com' })));
    expect(record.id).toBe(existing.id);
    expect(record.email).toBe('changed@example.com');
  });

  it('decide() appends an activity entry and sets status for approve', async () => {
    const service = new KycCaseService();
    const target = service.list().find((c) => c.status === 'pending')!;
    const activityBefore = target.activity.length;

    const record = await firstValueFrom(service.decide(target.id, { action: 'approve' }));
    expect(record.status).toBe('approved');
    expect(record.activity.length).toBe(activityBefore + 1);
    expect(record.activity.at(-1)?.label).toContain('Approved');

    service.commitDecide(record);
    expect(service.getById(target.id)?.status).toBe('approved');
  });

  it('decide() includes the reason for reject', async () => {
    const service = new KycCaseService();
    const target = service.list().find((c) => c.status === 'pending')!;

    const record = await firstValueFrom(service.decide(target.id, { action: 'reject', reason: 'Incomplete documents' }));
    expect(record.status).toBe('rejected');
    expect(record.activity.at(-1)?.label).toContain('Incomplete documents');
  });

  it('addDocument() appends a document and an activity entry', async () => {
    const service = new KycCaseService();
    const target = service.list()[0];
    const docsBefore = target.documents.length;

    const record = await firstValueFrom(
      service.addDocument(target.id, { type: 'Passport', fileName: 'passport.jpg', url: 'data:image/jpeg;base64,', mimeType: 'image/jpeg' })
    );
    expect(record.documents.length).toBe(docsBefore + 1);
    expect(record.activity.at(-1)?.label).toContain('passport.jpg');

    service.commitAddDocument(record);
    expect(service.getById(target.id)?.documents.length).toBe(docsBefore + 1);
  });

  it('getById() returns undefined for an unknown id', () => {
    const service = new KycCaseService();
    expect(service.getById(9999)).toBeUndefined();
  });
});
