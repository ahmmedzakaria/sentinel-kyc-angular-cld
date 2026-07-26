import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    // Everything behind the full console chrome (header/rail/breadcrumb/status bar)
    // lives here, gated by authGuard — unauthenticated visitors get bounced to /login.
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        // Matches the existing Customers > Operation > List nav item (moduleId: 'customers', path: 'list').
        path: 'customers/list',
        loadComponent: () =>
          import('./features/people/people-list/people-list.component').then((m) => m.PeopleListComponent)
      }
      // KYC and Admin feature areas, and the remaining Customers sub-items, get their
      // own lazy-loaded routes here following the same loadComponent pattern.
    ]
  }
];
