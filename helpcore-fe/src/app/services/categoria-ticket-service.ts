import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaTicket } from '../interfaces/categoria-ticket';
import { ResponseDto } from '../dto/response-dto';

@Injectable({
  providedIn: 'root'
})
export class CategoriaTicketService {
    private baseUrl = environment.apiUrl;
    private path = environment.categoriaTicketService;

    constructor(private http: HttpClient) {}

     listar(): Observable<CategoriaTicket[]> {
    return this.http.get<CategoriaTicket[]>(`${this.baseUrl}${this.path}/listar`);
  }

  listarTodas(): Observable<CategoriaTicket[]> {
    return this.http.get<CategoriaTicket[]>(`${this.baseUrl}${this.path}/listar-todas`);
  }

  listarPadres(): Observable<CategoriaTicket[]> {
    return this.http.get<CategoriaTicket[]>(`${this.baseUrl}${this.path}/listar-padres`);
  }

  obtenerPorId(id: number): Observable<CategoriaTicket> {
    return this.http.get<CategoriaTicket>(`${this.baseUrl}${this.path}/${id}`);
  }

  crear(categoria: CategoriaTicket): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(`${this.baseUrl}${this.path}/crear`, categoria);
  }

  actualizar(categoria: CategoriaTicket): Observable<ResponseDto> {
    return this.http.put<ResponseDto>(`${this.baseUrl}${this.path}/actualizar`, categoria);
  }

  eliminar(id: number): Observable<ResponseDto> {
    return this.http.delete<ResponseDto>(`${this.baseUrl}${this.path}/eliminar/${id}`);
  }
}
