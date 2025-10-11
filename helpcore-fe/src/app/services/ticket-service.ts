import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketDashboardAgente } from '../dto/ticket-dashboard-agente';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = environment.apiUrl;
  private path = environment.ticketService;

    
  constructor(private http: HttpClient) {}

    crearInvitado(ticketData: any): Observable<any> {
    return this.http.post(`${this.baseUrl + this.path}/crear-invitado`, ticketData);
  }

    listarDashboardAgente(): Observable<TicketDashboardAgente []> {
    return this.http.get<TicketDashboardAgente []>(
      `${this.baseUrl + this.path}/listar-dashboard-agente`
    );
  }
}
