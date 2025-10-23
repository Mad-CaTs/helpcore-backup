import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Sede } from '../interfaces/sede'

@Injectable({
  providedIn: 'root'
})
export class SedeService {
  private baseUrl = environment.apiUrl;
  private path = environment.sedeService;

  constructor(private http: HttpClient) {}

  listar(): Observable<Sede[]> {
    return this.http.get<Sede[]>(`${this.baseUrl}${this.path}/listar`);
  }
}
