import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Redirect to main login or standard client dashboard if logged in but not admin
  if (authService.isLoggedIn()) {
    router.navigate(['/client-dashboard']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
