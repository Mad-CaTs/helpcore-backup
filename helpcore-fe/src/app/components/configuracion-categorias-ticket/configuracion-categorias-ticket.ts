import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '../../services/alert-service';
import { CategoriaTicket } from '../../interfaces/categoria-ticket';
import { CategoriaTicketService } from '../../services/categoria-ticket-service';

declare var $: any;

@Component({
  selector: 'app-configuracion-categorias-ticket',
  standalone: false,
  templateUrl: './configuracion-categorias-ticket.html',
  styleUrl: './configuracion-categorias-ticket.css'
})
export class ConfiguracionCategoriasTicket implements OnInit, OnDestroy {

  categorias: CategoriaTicket[] = [];
  categoriasJerarquicas: CategoriaTicket[] = [];
  categoriasPadre: CategoriaTicket[] = [];
  categoriasExpandidas: Set<number> = new Set();

  // Para el modal de crear/editar

  readonly tipos = {
    padre: 'padre',
    hija: 'hija'
  } as const;

  modoEdicion = false;
  tipoCategoria: string = this.tipos.padre;

  categoriaForm: CategoriaTicket = {
    nombre: '',
    descripcion: '',
    idCategoriaPadre: undefined,
    activo: true,
    esPadre: true
  };

  constructor(
    private categoriaService: CategoriaTicketService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarCategorias();
    this.cargarCategoriasPadre();
  }

  cargarCategorias(): void {
    this.categoriaService.listarTodas()
      .subscribe({
        next: (data) => {
          this.categoriasJerarquicas = data;
          this.renderizarArbol();
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
          this.alertService.error('Error al cargar categorías.');
        }
      });
  }

  cargarCategoriasPadre(): void {
    this.categoriaService.listarPadres()
      .subscribe({
        next: (data) => {
          this.categoriasPadre = data;
        },
        error: (error) => {
          console.error('Error al cargar categorías padre:', error);
        }
      });
  }

  renderizarArbol(): void {
    const tbody = document.querySelector('#categoriasTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    this.categoriasJerarquicas.forEach(categoria => {
      this.agregarFilaCategoria(tbody, categoria, 0);
    });
  }

  agregarFilaCategoria(tbody: Element, categoria: CategoriaTicket, nivel: number): void {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', categoria.id?.toString() || '');
    tr.setAttribute('data-nivel', nivel.toString());
    
    if (nivel === 0) {
      tr.classList.add('categoria-padre-row');
    } else {
      tr.classList.add('categoria-hija-row');
      if (!this.categoriasExpandidas.has(categoria.idCategoriaPadre!)) {
        tr.style.display = 'none';
      }
    }

    // Columna Nombre con expansión
    const tdNombre = document.createElement('td');
    const indent = '&nbsp;'.repeat(nivel * 4);
    
    let iconoExpansion = '';
    if (categoria.subcategorias && categoria.subcategorias.length > 0) {
      const expandido = this.categoriasExpandidas.has(categoria.id!);
      iconoExpansion = `
        <i class="bi ${expandido ? 'bi-chevron-down' : 'bi-chevron-right'} text-primary me-2 icono-expandir" 
           style="cursor: pointer;" 
           data-id="${categoria.id}"></i>
      `;
    } else if (nivel > 0) {
      iconoExpansion = '<span class="me-4"></span>';
    }

    const iconoTipo = categoria.esPadre
      ? '<i class="bi bi-folder-fill text-warning me-2"></i>'
      : '<i class="bi bi-tag-fill text-info me-2"></i>';

    tdNombre.innerHTML = `
      ${indent}${iconoExpansion}${iconoTipo}
      <strong>${categoria.nombre}</strong>
    `;
    tr.appendChild(tdNombre);

    // Columna Descripción
    const tdDescripcion = document.createElement('td');
    tdDescripcion.textContent = categoria.descripcion || 'Sin descripción';
    tdDescripcion.className = categoria.descripcion ? '' : 'text-muted';
    tr.appendChild(tdDescripcion);

    // Columna Tipo
    const tdTipo = document.createElement('td');
    tdTipo.className = 'text-center';
    tdTipo.innerHTML = categoria.esPadre
      ? '<span class="badge bg-warning text-dark">Categoría Padre</span>'
      : '<span class="badge bg-info">Subcategoría</span>';
    tr.appendChild(tdTipo);

    // Columna Estado
    const tdEstado = document.createElement('td');
    tdEstado.className = 'text-center';
    tdEstado.innerHTML = categoria.activo
      ? '<span class="badge bg-success">Activo</span>'
      : '<span class="badge bg-danger">Inactivo</span>';
    tr.appendChild(tdEstado);

    // Columna Acciones
    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'text-center';
    tdAcciones.innerHTML = `
      <div class="d-flex justify-content-center gap-1">
        <button class="btn btn-light btn-sm rounded-circle btn-editar" 
                data-id="${categoria.id}" 
                title="Editar">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-light btn-sm rounded-circle btn-eliminar" 
                data-id="${categoria.id}" 
                title="Deshabilitar">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    tr.appendChild(tdAcciones);

    tbody.appendChild(tr);

    // Agregar subcategorías recursivamente
    if (categoria.subcategorias && categoria.subcategorias.length > 0) {
      categoria.subcategorias.forEach(subcategoria => {
        this.agregarFilaCategoria(tbody, subcategoria, nivel + 1);
      });
    }

    // Event listeners
    const iconoExpandirEl = tdNombre.querySelector('.icono-expandir');
    if (iconoExpandirEl) {
      iconoExpandirEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleExpansion(categoria.id!);
      });
    }

    const btnEditar = tdAcciones.querySelector('.btn-editar');
    if (btnEditar) {
      btnEditar.addEventListener('click', () => {
        this.abrirModalEditar(categoria.id!);
      });
    }

    const btnEliminar = tdAcciones.querySelector('.btn-eliminar');
    if (btnEliminar) {
      btnEliminar.addEventListener('click', () => {
        this.confirmarEliminar(categoria.id!);
      });
    }
  }

  toggleExpansion(categoriaId: number): void {
    if (this.categoriasExpandidas.has(categoriaId)) {
      this.categoriasExpandidas.delete(categoriaId);
      this.ocultarHijos(categoriaId);
    } else {
      this.categoriasExpandidas.add(categoriaId);
      this.mostrarHijos(categoriaId);
    }

    // Actualizar el icono
    const icono = document.querySelector(`.icono-expandir[data-id="${categoriaId}"]`);
    if (icono) {
      if (this.categoriasExpandidas.has(categoriaId)) {
        icono.classList.remove('bi-chevron-right');
        icono.classList.add('bi-chevron-down');
      } else {
        icono.classList.remove('bi-chevron-down');
        icono.classList.add('bi-chevron-right');
      }
    }
  }

  mostrarHijos(categoriaId: number): void {
    const categoria = this.encontrarCategoria(this.categoriasJerarquicas, categoriaId);
    if (categoria && categoria.subcategorias) {
      categoria.subcategorias.forEach(hijo => {
        const filaHijo = document.querySelector(`tr[data-id="${hijo.id}"]`) as HTMLElement;
        if (filaHijo) {
          filaHijo.style.display = '';
          
          // Si el hijo también está expandido, mostrar sus hijos
          if (this.categoriasExpandidas.has(hijo.id!)) {
            this.mostrarHijos(hijo.id!);
          }
        }
      });
    }
  }

  ocultarHijos(categoriaId: number): void {
    const categoria = this.encontrarCategoria(this.categoriasJerarquicas, categoriaId);
    if (categoria && categoria.subcategorias) {
      categoria.subcategorias.forEach(hijo => {
        const filaHijo = document.querySelector(`tr[data-id="${hijo.id}"]`) as HTMLElement;
        if (filaHijo) {
          filaHijo.style.display = 'none';
          
          // Ocultar recursivamente todos los descendientes
          if (hijo.subcategorias && hijo.subcategorias.length > 0) {
            this.ocultarHijos(hijo.id!);
          }
        }
      });
    }
  }

  encontrarCategoria(categorias: CategoriaTicket[], id: number): CategoriaTicket | null {
    for (const categoria of categorias) {
      if (categoria.id === id) {
        return categoria;
      }
      if (categoria.subcategorias) {
        const encontrada = this.encontrarCategoria(categoria.subcategorias, id);
        if (encontrada) {
          return encontrada;
        }
      }
    }
    return null;
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.tipoCategoria = 'padre';
    this.categoriaForm = {
      nombre: '',
      descripcion: '',
      idCategoriaPadre: undefined,
      activo: true,
      esPadre: true
    };
    ($('#categoriaModal') as any).modal('show');
  }

  abrirModalEditar(id: number): void {
    const categoria = this.encontrarCategoriaPlana(id);
    if (!categoria) return;

    this.modoEdicion = true;
    this.tipoCategoria = categoria.esPadre ? 'padre' : 'hija';
    this.categoriaForm = {
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      idCategoriaPadre: categoria.idCategoriaPadre,
      activo: categoria.activo,
      esPadre: categoria.esPadre
    };

    ($('#categoriaModal') as any).modal('show');
  }

  encontrarCategoriaPlana(id: number): CategoriaTicket | null {
    const buscarRecursivo = (categorias: CategoriaTicket[]): CategoriaTicket | null => {
      for (const cat of categorias) {
        if (cat.id === id) return cat;
        if (cat.subcategorias) {
          const found = buscarRecursivo(cat.subcategorias);
          if (found) return found;
        }
      }
      return null;
    };
    return buscarRecursivo(this.categoriasJerarquicas);
  }

  onTipoCategoriaChange(): void {
    if (this.tipoCategoria === 'padre') {
      this.categoriaForm.idCategoriaPadre = undefined;
      this.categoriaForm.esPadre = true;
    } else {
      this.categoriaForm.esPadre = false;
      if (this.categoriasPadre.length > 0 && !this.categoriaForm.idCategoriaPadre) {
        this.categoriaForm.idCategoriaPadre = this.categoriasPadre[0].id;
      }
    }
  }

  guardar(): void {
    if (!this.categoriaForm.nombre || this.categoriaForm.nombre.trim() === '') {
      this.alertService.error('El nombre de la categoría es obligatorio');
      return;
    }

    if (this.tipoCategoria === 'hija' && !this.categoriaForm.idCategoriaPadre) {
      this.alertService.error('Debe seleccionar una categoría padre');
      return;
    }

    const operacion = this.modoEdicion
      ? this.categoriaService.actualizar(this.categoriaForm)
      : this.categoriaService.crear(this.categoriaForm);

    operacion.subscribe({
      next: (response) => {
        if (response.success) {
          this.alertService.success(response.message);
          this.cargarDatos();
          this.cerrarModal();
        } else {
          this.alertService.error(response.message);
        }
      },
      error: (error) => {
        console.error('Error al guardar categoría:', error);
        this.alertService.error('Error al guardar la categoría');
      }
    });
  }

  confirmarEliminar(id: number): void {
    const categoria = this.encontrarCategoriaPlana(id);
    if (!categoria) return;

    this.alertService
      .confirm(
        '¿Estás seguro?',
        `Vas a deshabilitar la categoría "${categoria.nombre}"`,
        'Sí, deshabilitar',
        'Cancelar',
        'warning'
      )
      .then((confirmed) => {
        if (confirmed) {
          this.eliminar(id);
        }
      });
  }

  eliminar(id: number): void {
    this.categoriaService.eliminar(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.alertService.success(response.message);
          this.cargarDatos();
        } else {
          this.alertService.error(response.message);
        }
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        this.alertService.error('Error al deshabilitar la categoría');
      }
    });
  }

  cerrarModal(): void {
    this.tipoCategoria = 'padre';
    this.categoriaForm = {
      nombre: '',
      descripcion: '',
      idCategoriaPadre: undefined,
      activo: true,
      esPadre: true
    };
    ($('#categoriaModal') as any).modal('hide');
  }

  ngOnDestroy(): void {
    // Limpiar event listeners si es necesario
  }
}