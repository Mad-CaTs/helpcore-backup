import { Menu } from "./menu";

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
  menus?: Menu[];
}