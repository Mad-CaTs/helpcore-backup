export interface CrearAgenteRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string;
  correo: string;
  contrasena: string;
}