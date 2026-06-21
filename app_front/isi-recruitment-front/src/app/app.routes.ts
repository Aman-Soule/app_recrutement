import { Routes } from '@angular/router';
import { authGuard} from './guards/auth.guard';

export const routes: Routes = [
  // Pages publiques
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.Register)
  },
  // Layout principal (protégé)
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      // Dashboards
      {
        path: 'candidate/dashboard',
        loadComponent: () => import('./pages/candidate/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'recruiter/dashboard',
        loadComponent: () => import('./pages/recruiter/dashboard/dashboard').then(m => m.Dashboard)
      },
      // Redirection par défaut
      { path: '', redirectTo: '/candidate/dashboard', pathMatch: 'full' }
    ]
  },
  // Redirection 404
  { path: '**', redirectTo: '' }
];