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
}