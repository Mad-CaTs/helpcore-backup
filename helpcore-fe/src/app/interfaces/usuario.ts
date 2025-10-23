import { Persona } from "./persona";
import { Rol } from "./rol";

export interface Usuario {
  id: number;
  correo: string;
  persona: Persona;
  roles: Rol[];
  activo: boolean;
  fechaCreacion?: Date;
}