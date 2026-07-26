import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { PeopleService } from './people.service';
import { PersonDraft } from './people.model';

function draft(overrides: Partial<PersonDraft> = {}): PersonDraft {
  return {
    photoUrl: null,
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    mobile: '+880 1711 999888',
    gender: 'Other',
    education: "Bachelor's",
    ...overrides
  };
}

describe('PeopleService', () => {
  it('seeds with 3 people', () => {
    const service = new PeopleService();
    expect(service.list().length).toBe(3);
  });

  it('create() resolves with a new record and does not mutate state until commitCreate()', async () => {
    const service = new PeopleService();
    const before = service.list().length;

    const record = await firstValueFrom(service.create(draft()));
    expect(record.id).toBeGreaterThan(0);
    expect(service.list().length).toBe(before); // not committed yet

    service.commitCreate(record);
    expect(service.list().length).toBe(before + 1);
  });

  it('create() rejects a duplicate email (case-insensitive)', async () => {
    const service = new PeopleService();
    const existing = service.list()[0];

    await expect(firstValueFrom(service.create(draft({ email: existing.email.toUpperCase() })))).rejects.toThrow(
      /already exists/
    );
  });

  it('update() allows keeping the same email for the same record', async () => {
    const service = new PeopleService();
    const existing = service.list()[0];

    const record = await firstValueFrom(service.update(existing.id, draft({ email: existing.email, firstName: 'Changed' })));
    expect(record.firstName).toBe('Changed');
  });

  it('commitDelete() removes the record', () => {
    const service = new PeopleService();
    const target = service.list()[0];
    service.commitDelete(target.id);
    expect(service.list().some((p) => p.id === target.id)).toBe(false);
  });
});
