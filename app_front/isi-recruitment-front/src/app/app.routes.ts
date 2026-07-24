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
        path: 'candidate/jobs/:id',
        canActivate: [roleGuard],
        data: { role: 'candidate' },
        loadComponent: () =>
          import('./pages/candidate/job-detail/job-detail').then((m) => m.JobDetail),
      },
      {
        path: 'candidate/companies/:id',
        canActivate: [roleGuard],
        data: { role: 'candidate' },
        loadComponent: () =>
          import('./pages/candidate/company-detail/company-detail').then((m) => m.CompanyDetail),
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
      {
        path: 'candidate/profile/edit',
        canActivate: [roleGuard],
        data: { role: 'candidate' },
        loadComponent: () =>
          import('./pages/candidate/profile-edit/profile-edit').then((m) => m.ProfileEdit),
      },
      {
        path: 'candidate/profile/skills',
        canActivate: [roleGuard],
        data: { role: 'candidate' },
        loadComponent: () =>
          import('./pages/candidate/profile-skills/profile-skills').then((m) => m.ProfileSkills),
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
        path: 'recruiter/candidates/:id',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () =>
          import('./pages/recruiter/candidate-detail/candidate-detail').then((m) => m.CandidateDetail),
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
      {
        path: 'recruiter/settings/company/edit',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () =>
          import('./pages/recruiter/company-edit/company-edit').then((m) => m.CompanyEdit),
      },
      {
        path: 'recruiter/settings/profile/edit',
        canActivate: [roleGuard],
        data: { role: 'recruiter' },
        loadComponent: () =>
          import('./pages/recruiter/profile-edit/profile-edit').then((m) => m.ProfileEdit),
      },

      // Compte (accessible aux deux rôles)
      {
        path: 'account',
        loadComponent: () => import('./pages/shared/account/account').then((m) => m.Account),
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/shared/messages/messages').then((m) => m.Messages),
      },

      // Redirection par défaut (le roleGuard rebascule vers le bon dashboard si besoin)
      { path: '', redirectTo: '/candidate/dashboard', pathMatch: 'full' },
    ],
  },

  // Redirection 404
  { path: '**', redirectTo: '' },
];
