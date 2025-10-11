import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { Observable } from 'rxjs';
import { Menu } from '../../../interfaces/menu';
import { MenuService } from '../../../services/menu-service';

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar implements OnInit{

  isAuthenticated$: Observable<boolean>;

  activeLink: string = 'inicio';
  menus: Menu[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService
  ) {
      this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    this.cargarMenus();
    console.log(this.cargarMenus());
  }

  cargarMenus(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.menuService.listarPorUsuario().subscribe({
          next: (data) => {
            this.menus = data.filter(menu => menu.activo)
            .sort((a, b) => a.id - b.id);
          },
          error: (err) => {
            console.error('Error al obtener los menús del usuario', err);
            this.menus = [];
          }
        });
      } else {
        this.menus = [];
      }
    });
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
        this.menus = []; 
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
