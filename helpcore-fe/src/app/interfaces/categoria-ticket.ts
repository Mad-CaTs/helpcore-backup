export interface CategoriaTicket {
  id?: number;
  nombre: string;
  descripcion?: string;
  idCategoriaPadre?: number;
  subcategorias?: CategoriaTicket[];
  activo: boolean;
  esPadre: boolean;
}
