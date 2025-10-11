import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../interfaces/rol';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private baseUrl = environment.apiUrl;
  private path = environment.rolService;

  constructor(private http: HttpClient) { }

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl + this.path}/listar`)
  }

  crearRol(rol: Partial<Rol>): Observable<Rol> {
    return this.http.post<Rol>(`${this.baseUrl + this.path}/crear`, rol);
  }

  actualizarRol(rol: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.baseUrl + this.path}/actualizar`, rol);
  }

  eliminarRol(id: number) {
    return this.http.delete(`${this.baseUrl + this.path}/eliminar/${id}`);
  }

  buscarPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.baseUrl}${this.path}/${id}`);
  }
}
