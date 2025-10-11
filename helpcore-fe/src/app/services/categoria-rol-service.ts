import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaTicket } from '../interfaces/categoria-ticket';
import { Rol } from '../interfaces/rol';

@Injectable({
  providedIn: 'root'
})
export class CategoriaRolService {
  private baseUrl = environment.apiUrl;
  private path = environment.categoriaRolService;

  constructor(private http: HttpClient) {}

  /**
   * Asignar categorías a un rol (reemplaza las existentes)
   */
  asignarCategoriasARol(idRol: number, categoriasIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl + this.path}/${idRol}/asignar`, categoriasIds);
  }

  /**
   * Agregar categorías adicionales a un rol (mantiene las existentes)
   */
  agregarCategoriasARol(idRol: number, categoriasIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl + this.path}/${idRol}/agregar`, categoriasIds);
  }

  /**
   * Remover categorías específicas de un rol
   */
  removerCategoriasDeRol(idRol: number, categoriasIds: number[]): Observable<any> {
    return this.http.request('delete', `${this.baseUrl + this.path}/${idRol}/remover`, {
      body: categoriasIds
    });
  }

  /**
   * Obtener todas las categorías de un rol
   */
  obtenerCategoriasPorRol(idRol: number): Observable<CategoriaTicket[]> {
    return this.http.get<CategoriaTicket[]>(`${this.baseUrl + this.path}/${idRol}/categorias`);
  }

  /**
   * Obtener solo las categorías padre de un rol
   */
  obtenerCategoriasPadrePorRol(idRol: number): Observable<CategoriaTicket[]> {
    return this.http.get<CategoriaTicket[]>(`${this.baseUrl + this.path}/${idRol}/categorias/padres`);
  }

  /**
   * Obtener solo las categorías hijas de un rol
   */
  obtenerCategoriasHijasPorRol(idRol: number): Observable<CategoriaTicket[]> {
    return this.http.get<CategoriaTicket[]>(`${this.baseUrl + this.path}/${idRol}/categorias/hijas`);
  }

  /**
   * Verificar si un rol tiene acceso a una categoría
   */
  verificarAccesoACategoria(idRol: number, idCategoria: number): Observable<any> {
    return this.http.get(`${this.baseUrl + this.path}/${idRol}/tiene-acceso/${idCategoria}`);
  }

  /**
   * Obtener todos los roles que tienen acceso a una categoría
   */
  obtenerRolesPorCategoria(idCategoria: number): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl + this.path}/por-categoria/${idCategoria}`);
  }

  /**
   * Agregar una sola categoría a un rol
   */
  agregarCategoriaARol(idRol: number, idCategoria: number): Observable<any> {
    return this.http.post(`${this.baseUrl + this.path}/${idRol}/agregar`, [idCategoria]);
  }

  /**
   * Remover una sola categoría de un rol
   */
  removerCategoriaDeRol(idRol: number, idCategoria: number): Observable<any> {
    return this.http.request('delete', `${this.baseUrl + this.path}/${idRol}/remover`, {
      body: [idCategoria]
    });
  }

  /**
   * Obtener categorías disponibles (no asignadas) para un rol
   * Este método requiere obtener todas las categorías y filtrar las asignadas
   */
  obtenerCategoriasDisponibles(idRol: number, todasLasCategorias: CategoriaTicket[]): Observable<CategoriaTicket[]> {
    return new Observable(observer => {
      this.obtenerCategoriasPorRol(idRol).subscribe({
        next: (asignadas) => {
          const idsAsignados = new Set(asignadas.map(c => c.id));
          const disponibles = todasLasCategorias.filter(c => !idsAsignados.has(c.id));
          observer.next(disponibles);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}