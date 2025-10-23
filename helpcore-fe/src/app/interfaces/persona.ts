export interface Persona {
  id?: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string;
  codigoAlumno?: string;
  idSede?:number | 0;
  fechaNacimiento?: Date;
  direccion?: string;
}