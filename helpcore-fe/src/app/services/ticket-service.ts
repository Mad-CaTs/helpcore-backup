import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TicketDashboardAgente } from '../dto/ticket-dashboard-agente';
import { VerTicketDto } from '../dto/ver-ticket-dto';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = environment.apiUrl;
  private path = environment.ticketService;

  constructor(private http: HttpClient) { }

  crearInvitado(ticketData: any): Observable<any> {
    return this.http.post(`${this.baseUrl + this.path}/crear-invitado`, ticketData);
  }

  obtenerTicketsPorUsuario(idUsuario: number): Observable<TicketDashboardAgente[]> {
    return this.http.get<{
      success: boolean;
      tickets: TicketDashboardAgente[];
      total: number;
    }>(`${this.baseUrl + this.path}/dashboard/${idUsuario}`).pipe(
      map(response => response.tickets || [])
    );
  }

  crearUsuario(ticketData: any): Observable<any> {
    return this.http.post(`${this.baseUrl + this.path}/crear-usuario`, ticketData);
  }


  obtenerTicketCompleto(codigoTicket: string, idUsuario: number): Observable<VerTicketDto> {
    const params = new HttpParams()
      .set('codigoTicket', codigoTicket)
      .set('idUsuario', idUsuario.toString());

    return this.http.get<{
      success: boolean;
      ticket: VerTicketDto;
    }>(`${this.baseUrl + this.path}/ver-ticket`, { params }).pipe(
      map(response => response.ticket)
    );
  }

  tomarTicket(idTicket: number, idUsuarioAgente: number): Observable<any> {
  const params = new HttpParams()
    .set('idUsuarioAgente', idUsuarioAgente.toString());

  return this.http.put<any>(
    `${this.baseUrl + this.path}/tomar-ticket/${idTicket}`,
    {},
    { params }
  ).pipe(
    map(response => response.ticket)
  );
}
}