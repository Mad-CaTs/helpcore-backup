import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChatTicketDTO, MensajeDTO, RespuestaCargarArchivoDTO, RespuestaCrearMensajeDTO } from '../dto/mensaje-dto';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = environment.apiUrl;
  private path = environment.chatService;

  private mensajesSubject = new BehaviorSubject<MensajeDTO[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerChatTicket(idTicket: number, usuarioId: number): Observable<ChatTicketDTO> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId.toString());
    
    return this.http.get<ChatTicketDTO>(`${this.baseUrl + this.path}/ticket/${idTicket}`, { params });
  }

  crearMensaje(idTicket: number, mensaje: string, usuarioId: number): Observable<RespuestaCrearMensajeDTO> {
    const params = new HttpParams()
      .set('idTicket', idTicket.toString())
      .set('mensaje', mensaje)
      .set('usuarioId', usuarioId.toString());

    return this.http.post<RespuestaCrearMensajeDTO>(`${this.baseUrl + this.path}/mensaje`, {}, { params }).pipe(
      tap(respuesta => {
        if (respuesta.success && respuesta.mensajeCreado) {
          const mensajesActuales = this.mensajesSubject.value;
          this.mensajesSubject.next([...mensajesActuales, respuesta.mensajeCreado]);
        }
      })
    );
  }

  adjuntarArchivo(idRespuesta: number, archivo: File): Observable<RespuestaCargarArchivoDTO> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('idRespuesta', idRespuesta.toString());

    return this.http.post<RespuestaCargarArchivoDTO>(`${this.baseUrl + this.path}/adjuntar-archivo`, formData);
  }

  descargarArchivo(idArchivo: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl + this.path}/descargar-archivo/${idArchivo}`, { responseType: 'blob' });
  }

  actualizarMensajes(mensajes: MensajeDTO[]): void {
    this.mensajesSubject.next(mensajes);
  }

  obtenerMensajesActuales(): MensajeDTO[] {
    return this.mensajesSubject.value;
  }
}