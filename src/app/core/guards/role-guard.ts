import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as string[];
  const userRole = authService.getRole();

  if (userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};