import { Rol } from "./rol";

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  codigoAlumno: string;
  sede: string;
  correo: string;
  roles: Rol[];
  activo: boolean;
  fechaCreacion: string;
}