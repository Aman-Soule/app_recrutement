import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Pages publiques
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
  },

  // Layout principal (protégé)
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      // Espace candidat
      {
        path: 'candidate/dashboard',
        canActivate: [roleGuard],
        data: { role: 'candidate' },
        loadComponent: () =>
          import('./pages/candidate/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'candidate/jobs',
        canActivate: [roleGuard],
        data: { role: 'candidate' },
        loadComponent: () => import('./pages/candidate/jobs/jobs').then((m) => m.Jobs),
      },
      {
        path: 'candidate/applications',
        canActivate: [roleGuard],
        data: { role: 'candidate' },
        loadComponent: () =>
          import('./pages/candidate/applications/applications').then((m) => m.Applications),
      },
      {
        path: 'candidate/profile',
        canActivate: [roleGuard],
        data: { role: 'candidate' },
        loadComponent: () => import('./pages/candidate/profile/profile').then((m) => m.Profile),
      },

      // Espace recruteur
      {
        path: 'recruiter/dashboard',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () =>
          import('./pages/recruiter/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'recruiter/jobs',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () => import('./pages/recruiter/jobs/jobs').then((m) => m.Jobs),
      },
      {
        path: 'recruiter/candidates',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () =>
          import('./pages/recruiter/candidates/candidates').then((m) => m.Candidates),
      },
      {
        path: 'recruiter/interviews',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () =>
          import('./pages/recruiter/interviews/interviews').then((m) => m.Interviews),
      },
      {
        path: 'recruiter/analytics',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () =>
          import('./pages/recruiter/analytics/analytics').then((m) => m.Analytics),
      },
      {
        path: 'recruiter/settings',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () => import('./pages/recruiter/settings/settings').then((m) => m.Settings),
      },

      // Redirection par défaut (le roleGuard rebascule vers le bon dashboard si besoin)
      { path: '', redirectTo: '/candidate/dashboard', pathMatch: 'full' },
    ],
  },

  // Redirection 404
  { path: '**', redirectTo: '' },
];
