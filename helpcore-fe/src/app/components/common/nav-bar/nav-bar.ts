import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar {

  isAuthenticated$: Observable<boolean>;

  activeLink: string = 'inicio';
  constructor(
    private router: Router,
    private authService: AuthService
  ) {
      this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

   setActive(link: string) {
    this.activeLink = link;
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        console.error('Error en logout:', error);
      }
    });
  }

  onRegister() {
  this.router.navigate(['/register']);
  }
}
