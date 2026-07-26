import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { EMPTY_DRAFT, Person, PersonDraft } from './people.model';

const SEED: Person[] = [
  {
    id: 1,
    photoUrl: null,
    firstName: 'John',
    lastName: 'Ferreira',
    email: 'john.ferreira@example.com',
    mobile: '+880 1711 000111',
    gender: 'Male',
    education: "Bachelor's"
  },
  {
    id: 2,
    photoUrl: null,
    firstName: 'Maria',
    lastName: 'Chen',
    email: 'maria.chen@example.com',
    mobile: '+880 1711 000222',
    gender: 'Female',
    education: "Master's"
  },
  {
    id: 3,
    photoUrl: null,
    firstName: 'Ahsan',
    lastName: 'Karim',
    email: 'ahsan.karim@example.com',
    mobile: '+880 1711 000333',
    gender: 'Male',
    education: 'Doctorate'
  }
];

/** Simulated network latency so loading/error states are actually visible in the POC. */
const LATENCY_MS = 350;

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private readonly people = signal<Person[]>(SEED);
  private nextId = SEED.length + 1;

  readonly list = this.people.asReadonly();

  emptyDraft(): PersonDraft {
    return { ...EMPTY_DRAFT };
  }

  create(draft: PersonDraft): Observable<Person> {
    const conflict = this.emailTaken(draft.email);
    if (conflict) {
      return throwError(() => new Error(`A record with email "${draft.email}" already exists.`)).pipe(delay(LATENCY_MS));
    }
    const record: Person = { ...draft, id: this.nextId++ };
    return of(record).pipe(delay(LATENCY_MS));
  }

  update(id: number, draft: PersonDraft): Observable<Person> {
    const conflict = this.emailTaken(draft.email, id);
    if (conflict) {
      return throwError(() => new Error(`A record with email "${draft.email}" already exists.`)).pipe(delay(LATENCY_MS));
    }
    const record: Person = { ...draft, id };
    return of(record).pipe(delay(LATENCY_MS));
  }

  delete(_id: number): Observable<void> {
    return of(void 0).pipe(delay(LATENCY_MS));
  }

  /** Called by the list component once an Observable above resolves successfully. */
  commitCreate(record: Person): void {
    this.people.update((list) => [...list, record]);
  }

  commitUpdate(record: Person): void {
    this.people.update((list) => list.map((p) => (p.id === record.id ? record : p)));
  }

  commitDelete(id: number): void {
    this.people.update((list) => list.filter((p) => p.id !== id));
  }

  private emailTaken(email: string, excludeId?: number): boolean {
    return this.people().some((p) => p.email.toLowerCase() === email.toLowerCase() && p.id !== excludeId);
  }
}
