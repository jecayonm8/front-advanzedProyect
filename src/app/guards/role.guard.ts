import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { TokenService } from '../services/token-service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as string;

    if (!requiredRole) {
      return true; // No role required
    }

    const userRole = this.tokenService.getRole();

    if (userRole === requiredRole) {
      return true;
    } else {
      this.router.navigate(['/forbidden']);
      return false;
    }
  }
}