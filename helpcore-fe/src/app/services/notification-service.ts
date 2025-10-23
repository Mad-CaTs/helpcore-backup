import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NotificationService{
    private baseUrl = environment.apiUrl;
    private notificationPath = environment.notificationService;
    private verificationPath = environment.verificationService;

    constructor(private http: HttpClient) {}

    enviarCodigo(email: string): Observable<any>{
        return this.http.post(`${this.baseUrl + this.verificationPath}/enviar-correo`, {email})
    }

    validarCodigo(email: string, code: string): Observable<any>{
        return this.http.post(`${this.baseUrl + this.verificationPath}/validar-codigo`, {email, code});
    }

    enviarNotificacionTicket(ticketData: any): Observable<any> {
        return this.http.post(`${this.baseUrl + this.notificationPath}/ticket-creado`, ticketData);
    }

    enviarNotificacionTicketUsuario(idUsuario: number, ticketData: any): Observable<any> {
        return this.http.post(`${this.baseUrl + this.notificationPath}/ticket-creado/${idUsuario}`, ticketData);
    }

    enviarCodigoPorCodigoTicket(codigoTicket: string): Observable<any>{
        return this.http.post(`${this.baseUrl + this.verificationPath}/consultar-ticket/${codigoTicket}`, {});
    }

    validarCodigoPorTicket(ticketId: string, code: string) {
        return this.http.post<any>(`${this.baseUrl + this.verificationPath}/validar-codigo/${ticketId}`, { code });
    }
}