import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Role } from '../models/user.model';

/** Redirige vers le dashboard du bon rôle si l'utilisateur n'a pas accès à cette section */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data?.['role'] as Role | undefined;
  const currentRole = authService.role();

  if (!requiredRole || currentRole === requiredRole) {
    return true;
  }

  router.navigate([currentRole === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard']);
  return false;
};
