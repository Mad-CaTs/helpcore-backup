import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../interfaces/usuario';
import { CrearAgenteRequest } from '../dto/crear-agente-request';
import { EditarAgenteRequest } from '../dto/editar-agente-request';


@Injectable({
  providedIn: 'root'
})
export class AgenteService {
  private baseUrl = environment.apiUrl;
  private path = environment.agenteService;

  constructor(private http: HttpClient) { }

  listarAgentes(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}${this.path}/listar`);
  }

  crearAgente(datos: CrearAgenteRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}${this.path}/crear`, datos);
  }

  editarAgente(id: number, datos: EditarAgenteRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}${this.path}/actualizar/${id}`, datos);
  }

  deshabilitarAgente(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}${this.path}/deshabilitar/${id}`, {});
  }

  obtenerAgente(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}${this.path}/${id}`);
  }
}