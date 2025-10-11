import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Menu } from '../interfaces/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseUrl = environment.apiUrl;
  private path = environment.menuService;

  constructor(private http: HttpClient) {}

  listar(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl + this.path}/listar`);
  }

  listarPorUsuario(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl + this.path}/listar/usuario`);
  }

  actualizarMenu(menu: Menu): Observable<Menu> {
    return this.http.put<Menu>(`${this.baseUrl + this.path}/actualizar`, menu);
  }

  eliminarMenu(id: number) {
    return this.http.delete(`${this.baseUrl + this.path}/eliminar/${id}`);
  }
}
