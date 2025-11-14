import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../services/token-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly title = signal('ReservasJSN');

  private tokenService = inject(TokenService);
  private router = inject(Router);

  protected isLoggedIn = computed(() => this.tokenService.isLogged());
  protected userName = computed(() => this.tokenService.getName());

  protected logout() {
    this.tokenService.logout();
    this.router.navigate(['/login']);
  }
}
