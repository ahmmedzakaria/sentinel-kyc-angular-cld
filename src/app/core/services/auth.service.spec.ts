import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no session when localStorage is empty', () => {
    const auth = new AuthService();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.currentUser()).toBeNull();
  });

  it('login() resolves for the seeded demo account', async () => {
    const auth = new AuthService();
    const user = await firstValueFrom(
      auth.login({ email: 'amina.osei@sentinel-kyc.com', password: 'Password123' })
    );
    expect(user.name).toBe('Amina Osei');
  });

  it('login() rejects incorrect credentials', async () => {
    const auth = new AuthService();
    await expect(
      firstValueFrom(auth.login({ email: 'amina.osei@sentinel-kyc.com', password: 'wrong' }))
    ).rejects.toThrow(/Incorrect email or password/);
  });

  it('setSession() updates state and persists to localStorage', async () => {
    const auth = new AuthService();
    const user = await firstValueFrom(
      auth.login({ email: 'amina.osei@sentinel-kyc.com', password: 'Password123' })
    );
    auth.setSession(user);
    expect(auth.isAuthenticated()).toBe(true);
    expect(JSON.parse(localStorage.getItem('sentinel-kyc.session')!).email).toBe(user.email);
  });

  it('register() rejects a duplicate email', async () => {
    const auth = new AuthService();
    await expect(
      firstValueFrom(auth.register({ name: 'X', email: 'amina.osei@sentinel-kyc.com', password: 'whatever1' }))
    ).rejects.toThrow(/already exists/);
  });

  it('register() then login() works for the new account', async () => {
    const auth = new AuthService();
    await firstValueFrom(auth.register({ name: 'New Person', email: 'new.person@example.com', password: 'secret123' }));
    const user = await firstValueFrom(auth.login({ email: 'new.person@example.com', password: 'secret123' }));
    expect(user.name).toBe('New Person');
  });

  it('logout() clears state and localStorage', async () => {
    const auth = new AuthService();
    const user = await firstValueFrom(
      auth.login({ email: 'amina.osei@sentinel-kyc.com', password: 'Password123' })
    );
    auth.setSession(user);
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('sentinel-kyc.session')).toBeNull();
  });
});
