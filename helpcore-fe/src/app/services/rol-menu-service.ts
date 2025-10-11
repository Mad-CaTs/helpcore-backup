import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Menu } from '../interfaces/menu';

@Injectable({
  providedIn: 'root'
})
export class RolMenuService {
  private baseUrl = environment.apiUrl;
  private path = '/rol-menu';

  constructor(private http: HttpClient) {}

  /**
   * Asignar múltiples menús a un rol (reemplaza los existentes)
   */
  asignarMenus(rolId: number, menuIds: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl + this.path}/asignar/${rolId}`, menuIds);
  }

  /**
   * Agregar un menú a un rol (sin eliminar los existentes)
   */
  agregarMenu(rolId: number, menuId: number): Observable<any> {
    return this.http.post(`${this.baseUrl + this.path}/agregar/${rolId}/menu/${menuId}`, {});
  }

  /**
   * Quitar un menú de un rol
   */
  quitarMenu(rolId: number, menuId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl + this.path}/quitar/${rolId}/menu/${menuId}`);
  }

  /**
   * Obtener todos los menús asignados a un rol
   */
  obtenerMenusPorRol(rolId: number): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl + this.path}/${rolId}/menus`);
  }

  /**
   * Obtener menús disponibles (no asignados) para un rol
   */
  obtenerMenusDisponibles(rolId: number): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl + this.path}/${rolId}/menus-disponibles`);
  }
}