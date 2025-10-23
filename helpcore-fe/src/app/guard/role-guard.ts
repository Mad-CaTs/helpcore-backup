import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { AlertService } from '../services/alert-service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private alertaService: AlertService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles = route.data['roles'] as string[];
    
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    if (this.authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    this.alertaService.error('Acceso denegado: El usuario no tiene los roles necesarios');
    this.router.navigate(['/inicio']);
    return false;
  }
}