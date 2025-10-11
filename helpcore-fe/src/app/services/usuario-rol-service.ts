import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Usuario } from '../interfaces/usuario';
import { Observable } from 'rxjs';
import { Rol } from '../interfaces/rol';

@Injectable({
  providedIn: 'root'
})
export class UsuarioRolService {
  private baseUrl = environment.apiUrl;
  private path = environment.usuarioRolService;

  constructor(private http: HttpClient) {}

  listarUsuariosConRoles(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}${this.path}/listar`);
  }

  asignarRol(idUsuario: number, idRol: number): Observable<Usuario> {
    const params = new HttpParams()
      .set('idUsuario', idUsuario.toString())
      .set('idRol', idRol.toString());

    return this.http.post<Usuario>(
      `${this.baseUrl}${this.path}/asignar`,
      null,
      { params }
    );
  }

  removerRol(idUsuario: number, idRol: number): Observable<Usuario> {
    const params = new HttpParams()
      .set('idUsuario', idUsuario.toString())
      .set('idRol', idRol.toString());

    return this.http.delete<Usuario>(
      `${this.baseUrl}${this.path}/remover`,
      { params }
    );
  }

  editarRoles(idUsuario: number, nuevosRoles: number[]): Observable<Usuario> {
    const params = new HttpParams()
      .set('idUsuario', idUsuario.toString());

    return this.http.put<Usuario>(
      `${this.baseUrl}${this.path}/editar`,
      nuevosRoles,
      { params }
    );
  }
}