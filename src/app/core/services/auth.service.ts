import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { LoginCredentials, RegisterDraft, User } from '../models/user.model';

interface StoredAccount {
  user: User;
  password: string;
}

const STORAGE_KEY = 'sentinel-kyc.session';
const LATENCY_MS = 400;

/** Seeded so the profile shown throughout the header (Amina Osei / Compliance Officer) is a real, loggable-in account. */
const SEED_ACCOUNTS: StoredAccount[] = [
  {
    user: { id: 1, name: 'Amina Osei', email: 'amina.osei@sentinel-kyc.com', role: 'Compliance Officer' },
    password: 'Password123'
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accounts = signal<StoredAccount[]>(SEED_ACCOUNTS);
  private nextId = SEED_ACCOUNTS.length + 1;

  readonly currentUser = signal<User | null>(this.readSession());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(credentials: LoginCredentials): Observable<User> {
    const account = this.accounts().find((a) => a.user.email.toLowerCase() === credentials.email.toLowerCase());

    if (!account || account.password !== credentials.password) {
      return throwError(() => new Error('Incorrect email or password.')).pipe(delay(LATENCY_MS));
    }
    return of(account.user).pipe(delay(LATENCY_MS));
  }

  register(draft: RegisterDraft): Observable<User> {
    const taken = this.accounts().some((a) => a.user.email.toLowerCase() === draft.email.toLowerCase());
    if (taken) {
      return throwError(() => new Error(`An account with email "${draft.email}" already exists.`)).pipe(delay(LATENCY_MS));
    }
    const user: User = { id: this.nextId++, name: draft.name, email: draft.email, role: 'Compliance Officer' };
    this.accounts.update((list) => [...list, { user, password: draft.password }]);
    return of(user).pipe(delay(LATENCY_MS));
  }

  /** Called once login()/register() resolves successfully. */
  setSession(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private readSession(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
