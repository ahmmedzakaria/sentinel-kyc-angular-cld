import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LayoutConfigService } from '../services/layout-config.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // AppShellComponent (header/rail/status-bar) reads its nav tree, content
  // lists, and theme from LayoutConfigService — load it here so the shell
  // never mounts before that data exists. Fails soft: if the load errors,
  // let navigation proceed anyway rather than locking an authenticated user
  // out entirely — the config signals just stay at their empty defaults.
  const layoutConfig = inject(LayoutConfigService);
  return layoutConfig.ensureLoaded().pipe(
    map(() => true),
    catchError(() => of(true))
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
