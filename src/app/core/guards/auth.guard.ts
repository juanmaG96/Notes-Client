import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isInitialCheckDone()) {
    if (authService.isAuthenticated()) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  }

  return authService.checkAuth().pipe(
    map(user => {
      if (user !== null) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isInitialCheckDone()) {
    if (authService.isAuthenticated()) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }

  return authService.checkAuth().pipe(
    map(user => {
      if (user !== null) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};
