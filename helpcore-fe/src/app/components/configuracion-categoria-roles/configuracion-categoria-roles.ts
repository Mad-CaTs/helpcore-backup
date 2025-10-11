import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '../../services/alert-service';
import { Rol } from '../../interfaces/rol';
import { CategoriaTicket } from '../../interfaces/categoria-ticket';
import { CategoriaRolService } from '../../services/categoria-rol-service';
import { RolService } from '../../services/rol-service';
import { CategoriaTicketService } from '../../services/categoria-ticket-service';
import { forkJoin } from 'rxjs';


declare var $: any;

@Component({
  selector: 'app-configuracion-categoria-roles',
  standalone: false,
  templateUrl: './configuracion-categoria-roles.html',
  styleUrls: ['./configuracion-categoria-roles.css']
})
export class ConfiguracionCategoriaRoles implements OnInit, OnDestroy {

  roles: Rol[] = [];
  todasLasCategorias: CategoriaTicket[] = [];
  categoriasDisponibles: CategoriaTicket[] = [];
  categoriasAsignadas: CategoriaTicket[] = [];
  rolSeleccionado: Rol | null = null;

  categoriasExpandidasDisponibles: Set<number> = new Set();
  categoriasExpandidasAsignadas: Set<number> = new Set();
  categoriasSeleccionadas: Set<number> = new Set();
  categoriasSeleccionadasAsignadas: Set<number> = new Set();

  constructor(
    private categoriaRolService: CategoriaRolService,
    private rolService: RolService,
    private categoriaService: CategoriaTicketService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarTodasLasCategorias();
  }

  cargarRoles(): void {
    this.rolService.listarRoles()
      .subscribe({
        next: (data: any) => {
          this.roles = data;
        },
        error: (error: any) => {
          console.error('Error al cargar roles:', error);
          this.alertService.error('Error al cargar roles.');
        }
      });
  }

  cargarTodasLasCategorias(): void {
    this.categoriaService.listarTodas()
      .subscribe({
        next: (data: CategoriaTicket[]) => {
          this.todasLasCategorias = data;
        },
        error: (error: any) => {
          console.error('Error al cargar categorías:', error);
          this.alertService.error('Error al cargar categorías.');
        }
      });
  }

  onRolChange(event: any): void {
    const rolId = parseInt(event.target.value);
    if (!rolId) {
      this.rolSeleccionado = null;
      this.categoriasDisponibles = [];
      this.categoriasAsignadas = [];
      return;
    }

    this.rolSeleccionado = this.roles.find(r => r.id === rolId) || null;
    this.cargarCategoriasPorRol(rolId);
  }

  cargarCategoriasPorRol(rolId: number): void {
    this.categoriasSeleccionadas.clear();
    this.categoriasSeleccionadasAsignadas.clear();

    // Limpiar estados de expansión para evitar inconsistencias
    this.categoriasExpandidasDisponibles.clear();
    this.categoriasExpandidasAsignadas.clear();

    // Cargar las categorías asignadas (IDs planos del backend)
    this.categoriaRolService.obtenerCategoriasPorRol(rolId).subscribe({
      next: (asignadasPlanas: CategoriaTicket[]) => {
        // Reconstruir la jerarquía de las asignadas
        const idsAsignados = new Set(asignadasPlanas.map(c => c.id!));
        this.categoriasAsignadas = this.reconstruirJerarquia(this.todasLasCategorias, idsAsignados);

        // Calcular disponibles (las que no están asignadas)
        this.categoriasDisponibles = this.filtrarCategoriasDisponibles(this.todasLasCategorias, idsAsignados);

        this.renderizarArbolDisponibles();
        this.renderizarArbolAsignadas();
      },
      error: (error: any) => {
        console.error('Error al cargar categorías asignadas:', error);
        this.alertService.error('Error al cargar categorías asignadas.');
      }
    });
  }
  reconstruirJerarquia(categorias: CategoriaTicket[], idsAsignados: Set<number>): CategoriaTicket[] {
  const resultado: CategoriaTicket[] = [];
  const hijosOrfanos: CategoriaTicket[] = [];

  categorias.forEach(cat => {
    if (idsAsignados.has(cat.id!)) {
      const categoriaClone = { ...cat };

      // Si tiene subcategorías, filtrar solo las asignadas
      if (cat.subcategorias && cat.subcategorias.length > 0) {
        const subcategoriasAsignadas = cat.subcategorias.filter(sub => idsAsignados.has(sub.id!));
        categoriaClone.subcategorias = subcategoriasAsignadas;
      }

      resultado.push(categoriaClone);
    } else {
      // El padre no está asignado, pero verificar si alguna hija sí lo está
      if (cat.subcategorias && cat.subcategorias.length > 0) {
        cat.subcategorias.forEach(sub => {
          if (idsAsignados.has(sub.id!)) {
            // Subcategoría huérfana: su padre no está asignado pero ella sí
            hijosOrfanos.push({ ...sub });
          }
        });
      }
    }
  });

  // Agregar las subcategorías huérfanas al final como si fueran padres
  return [...resultado, ...hijosOrfanos];
}
  obtenerTodosLosIds(categorias: CategoriaTicket[]): Set<number> {
    const ids = new Set<number>();
    const agregar = (cats: CategoriaTicket[]) => {
      cats.forEach(cat => {
        if (cat.id) ids.add(cat.id);
        if (cat.subcategorias && cat.subcategorias.length > 0) {
          agregar(cat.subcategorias);
        }
      });
    };
    agregar(categorias);
    return ids;
  }

 filtrarCategoriasDisponibles(todas: CategoriaTicket[], idsAsignados: Set<number>): CategoriaTicket[] {
  const resultado: CategoriaTicket[] = [];
  const hijosOrfanosDisponibles: CategoriaTicket[] = [];

  todas.forEach(cat => {
    // Si la categoría padre NO está asignada
    if (!idsAsignados.has(cat.id!)) {
      // Si es padre y tiene subcategorías
      if (cat.subcategorias && cat.subcategorias.length > 0) {
        // Filtrar las subcategorías que NO están asignadas
        const subcategoriasDisponibles = cat.subcategorias.filter(sub => !idsAsignados.has(sub.id!));
        
        // Si tiene al menos una subcategoría disponible, mostrar el padre
        if (subcategoriasDisponibles.length > 0) {
          resultado.push({
            ...cat,
            subcategorias: subcategoriasDisponibles
          });
        }
      } else {
        // Es una categoría simple (no tiene hijos) y no está asignada
        resultado.push({ ...cat });
      }
    } else {
      // El padre SÍ está asignado, pero verificar si alguna hija NO lo está
      if (cat.subcategorias && cat.subcategorias.length > 0) {
        cat.subcategorias.forEach(sub => {
          if (!idsAsignados.has(sub.id!)) {
            // Subcategoría huérfana disponible: su padre está asignado pero ella no
            hijosOrfanosDisponibles.push({ ...sub });
          }
        });
      }
    }
  });

  // Agregar las subcategorías huérfanas disponibles al final como si fueran padres
  return [...resultado, ...hijosOrfanosDisponibles];
}

  renderizarArbolDisponibles(): void {
    const tbody = document.querySelector('#categoriasDisponiblesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    this.categoriasDisponibles.forEach(categoria => {
      this.agregarFilaCategoria(tbody, categoria, 0, 'disponibles');
    });
  }

  renderizarArbolAsignadas(): void {
    const tbody = document.querySelector('#categoriasAsignadasTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    this.categoriasAsignadas.forEach(categoria => {
      this.agregarFilaCategoria(tbody, categoria, 0, 'asignadas');
    });
  }

  agregarFilaCategoria(tbody: Element, categoria: CategoriaTicket, nivel: number, tipo: 'disponibles' | 'asignadas'): void {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', categoria.id?.toString() || '');
    tr.setAttribute('data-nivel', nivel.toString());

    const expandidas = tipo === 'disponibles' ? this.categoriasExpandidasDisponibles : this.categoriasExpandidasAsignadas;

    if (nivel === 0) {
      tr.classList.add('categoria-padre-row');
    } else {
      tr.classList.add('categoria-hija-row');
      if (!expandidas.has(categoria.idCategoriaPadre!)) {
        tr.style.display = 'none';
      }
    }

    // Columna Checkbox
    const tdCheck = document.createElement('td');
    tdCheck.className = 'text-center align-middle';
    tdCheck.innerHTML = `<input type="checkbox" class="form-check-input categoria-checkbox" data-id="${categoria.id}">`;
    tr.appendChild(tdCheck);

    // Columna Nombre
    const tdNombre = document.createElement('td');
    const indent = '&nbsp;'.repeat(nivel * 4);

    let iconoExpansion = '';
    if (categoria.subcategorias && categoria.subcategorias.length > 0) {
      const expandido = expandidas.has(categoria.id!);
      iconoExpansion = `
        <i class="bi ${expandido ? 'bi-chevron-down' : 'bi-chevron-right'} text-primary me-2 icono-expandir" 
           style="cursor: pointer;" 
           data-id="${categoria.id}"
           data-tipo="${tipo}"></i>
      `;
    } else if (nivel > 0) {
      iconoExpansion = '<span class="me-4"></span>';
    }

    const iconoTipo = categoria.esPadre
      ? '<i class="bi bi-folder-fill text-warning me-2"></i>'
      : '<i class="bi bi-tag-fill text-info me-2"></i>';

    tdNombre.innerHTML = `${indent}${iconoExpansion}${iconoTipo}<strong>${categoria.nombre}</strong>`;
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

    // Columna Acciones
    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'text-center';

    if (tipo === 'disponibles') {
      tdAcciones.innerHTML = `
        <button class="btn btn-success btn-sm rounded-pill btn-agregar" 
                data-id="${categoria.id}" 
                title="Agregar">
          <i class="bi bi-plus-circle me-1"></i>Agregar
        </button>
      `;
    } else {
      tdAcciones.innerHTML = `
        <button class="btn btn-danger btn-sm rounded-pill btn-quitar" 
                data-id="${categoria.id}" 
                title="Quitar">
          <i class="bi bi-dash-circle me-1"></i>Quitar
        </button>
      `;
    }
    tr.appendChild(tdAcciones);

    tbody.appendChild(tr);

    // Agregar subcategorías recursivamente
    if (categoria.subcategorias && categoria.subcategorias.length > 0) {
      categoria.subcategorias.forEach(sub => {
        this.agregarFilaCategoria(tbody, sub, nivel + 1, tipo);
      });
    }

    // Event listeners
    const iconoExpandirEl = tdNombre.querySelector('.icono-expandir');
    if (iconoExpandirEl) {
      iconoExpandirEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleExpansion(categoria.id!, tipo);
      });
    }

    const checkbox = tr.querySelector('.categoria-checkbox') as HTMLInputElement;
if (checkbox) {
  checkbox.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const idStr = target.getAttribute('data-id');
    if (idStr) {
      const id = parseInt(idStr);
      const setSeleccionadas = tipo === 'disponibles' ? this.categoriasSeleccionadas : this.categoriasSeleccionadasAsignadas;
      
      if (target.checked) {
        setSeleccionadas.add(id);
        // Si es padre, seleccionar todas las hijas
        if (categoria.esPadre && categoria.subcategorias) {
          this.seleccionarHijasRecursivo(categoria, true, tipo);
        }
      } else {
        setSeleccionadas.delete(id);
        // Si es padre, deseleccionar todas las hijas
        if (categoria.esPadre && categoria.subcategorias) {
          this.seleccionarHijasRecursivo(categoria, false, tipo);
        }
      }
    }
  });
}

   if (tipo === 'disponibles') {
  const btnAgregar = tdAcciones.querySelector('.btn-agregar');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      // Si es padre, agregar padre e hijas
      if (categoria.esPadre && categoria.subcategorias && categoria.subcategorias.length > 0) {
        const ids = [categoria.id!, ...categoria.subcategorias.map(sub => sub.id!)];
        this.agregarCategorias(ids);
      } else {
        this.agregarCategoria(categoria.id!);
      }
    });
  }
} else {
  const btnQuitar = tdAcciones.querySelector('.btn-quitar');
  if (btnQuitar) {
    btnQuitar.addEventListener('click', () => {
      // Si es padre, quitar padre e hijas
      if (categoria.esPadre && categoria.subcategorias && categoria.subcategorias.length > 0) {
        const ids = [categoria.id!, ...categoria.subcategorias.map(sub => sub.id!)];
        this.quitarCategorias(ids);
      } else {
        this.quitarCategoria(categoria.id!);
      }
    });
  }
}
  }

 seleccionarHijasRecursivo(categoria: CategoriaTicket, seleccionar: boolean, tipo: 'disponibles' | 'asignadas'): void {
  const setSeleccionadas = tipo === 'disponibles' ? this.categoriasSeleccionadas : this.categoriasSeleccionadasAsignadas;
  
  if (categoria.subcategorias) {
    categoria.subcategorias.forEach(hijo => {
      if (seleccionar) {
        setSeleccionadas.add(hijo.id!);
      } else {
        setSeleccionadas.delete(hijo.id!);
      }

      // Actualizar el checkbox visualmente
      const checkboxHijo = document.querySelector(`.categoria-checkbox[data-id="${hijo.id}"]`) as HTMLInputElement;
      if (checkboxHijo) {
        checkboxHijo.checked = seleccionar;
      }

      // Recursivo para nietos (aunque solo permites 2 niveles)
      if (hijo.subcategorias) {
        this.seleccionarHijasRecursivo(hijo, seleccionar, tipo);
      }
    });
  }
}

  toggleExpansion(categoriaId: number, tipo: 'disponibles' | 'asignadas'): void {
    const expandidas = tipo === 'disponibles' ? this.categoriasExpandidasDisponibles : this.categoriasExpandidasAsignadas;
    const categorias = tipo === 'disponibles' ? this.categoriasDisponibles : this.categoriasAsignadas;

    if (expandidas.has(categoriaId)) {
      expandidas.delete(categoriaId);
      this.ocultarHijos(categoriaId, tipo);
    } else {
      expandidas.add(categoriaId);
      this.mostrarHijos(categoriaId, tipo);
    }

    const icono = document.querySelector(`.icono-expandir[data-id="${categoriaId}"][data-tipo="${tipo}"]`);
    if (icono) {
      if (expandidas.has(categoriaId)) {
        icono.classList.remove('bi-chevron-right');
        icono.classList.add('bi-chevron-down');
      } else {
        icono.classList.remove('bi-chevron-down');
        icono.classList.add('bi-chevron-right');
      }
    }
  }

  mostrarHijos(categoriaId: number, tipo: 'disponibles' | 'asignadas'): void {
    const categorias = tipo === 'disponibles' ? this.categoriasDisponibles : this.categoriasAsignadas;
    const expandidas = tipo === 'disponibles' ? this.categoriasExpandidasDisponibles : this.categoriasExpandidasAsignadas;

    const categoria = this.encontrarCategoria(categorias, categoriaId);
    if (categoria && categoria.subcategorias) {
      categoria.subcategorias.forEach(hijo => {
        const filaHijo = document.querySelector(`tr[data-id="${hijo.id}"]`) as HTMLElement;
        if (filaHijo) {
          filaHijo.style.display = '';
          if (expandidas.has(hijo.id!)) {
            this.mostrarHijos(hijo.id!, tipo);
          }
        }
      });
    }
  }

  ocultarHijos(categoriaId: number, tipo: 'disponibles' | 'asignadas'): void {
    const categorias = tipo === 'disponibles' ? this.categoriasDisponibles : this.categoriasAsignadas;

    const categoria = this.encontrarCategoria(categorias, categoriaId);
    if (categoria && categoria.subcategorias) {
      categoria.subcategorias.forEach(hijo => {
        const filaHijo = document.querySelector(`tr[data-id="${hijo.id}"]`) as HTMLElement;
        if (filaHijo) {
          filaHijo.style.display = 'none';
          if (hijo.subcategorias && hijo.subcategorias.length > 0) {
            this.ocultarHijos(hijo.id!, tipo);
          }
        }
      });
    }
  }

  encontrarCategoria(categorias: CategoriaTicket[], id: number): CategoriaTicket | null {
    for (const categoria of categorias) {
      if (categoria.id === id) return categoria;
      if (categoria.subcategorias) {
        const encontrada = this.encontrarCategoria(categoria.subcategorias, id);
        if (encontrada) return encontrada;
      }
    }
    return null;
  }

  agregarCategoria(categoriaId: number): void {
    if (!this.rolSeleccionado) return;

    this.categoriaRolService.agregarCategoriaARol(this.rolSeleccionado.id, categoriaId).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.alertService.success(resp.message);
          this.cargarCategoriasPorRol(this.rolSeleccionado!.id);
        } else {
          this.alertService.error(resp.message);
        }
      },
      error: () => {
        this.alertService.error('Error al agregar la categoría');
      }
    });
  }

  agregarCategorias(categoriaIds: number[]): void {
    if (!this.rolSeleccionado) return;

    this.categoriaRolService.agregarCategoriasARol(this.rolSeleccionado.id, categoriaIds).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.alertService.success(resp.message);
          this.cargarCategoriasPorRol(this.rolSeleccionado!.id);
        } else {
          this.alertService.error(resp.message);
        }
      },
      error: () => {
        this.alertService.error('Error al agregar las categorías');
      }
    });
  }

  quitarCategoria(categoriaId: number): void {
    if (!this.rolSeleccionado) return;

    const categoria = this.encontrarCategoria(this.categoriasAsignadas, categoriaId);
    if (!categoria) return;

    this.alertService
      .confirm(
        '¿Estás seguro?',
        `Vas a quitar la categoría "${categoria.nombre}" del rol "${this.rolSeleccionado.nombre}"`,
        'Sí, quitar',
        'Cancelar',
        'warning'
      )
      .then((confirmed) => {
        if (confirmed) {
          this.categoriaRolService.removerCategoriaDeRol(this.rolSeleccionado!.id, categoriaId).subscribe({
            next: (resp: any) => {
              if (resp.success) {
                this.alertService.success(resp.message);
                this.cargarCategoriasPorRol(this.rolSeleccionado!.id);
              } else {
                this.alertService.error(resp.message);
              }
            },
            error: () => {
              this.alertService.error('Error al quitar la categoría');
            }
          });
        }
      });
  }

  asignarCategoriasSeleccionadas(): void {
    if (!this.rolSeleccionado) {
      this.alertService.error('Debe seleccionar un rol');
      return;
    }

    if (this.categoriasSeleccionadas.size === 0) {
      this.alertService.error('Debe seleccionar al menos una categoría');
      return;
    }

    const categoriaIds = Array.from(this.categoriasSeleccionadas);

    // Filtrar para agregar también las hijas si se selecciona un padre
    const idsFinales = new Set(categoriaIds);
    categoriaIds.forEach(id => {
      const categoria = this.encontrarCategoria(this.categoriasDisponibles, id);
      if (categoria && categoria.esPadre && categoria.subcategorias) {
        categoria.subcategorias.forEach(hijo => idsFinales.add(hijo.id!));
      }
    });

    const idsArray = Array.from(idsFinales);

    this.alertService
      .confirm(
        '¿Confirmar asignación?',
        `Se agregarán ${idsArray.length} categoría(s) al rol "${this.rolSeleccionado.nombre}"`,
        'Sí, agregar',
        'Cancelar',
        'info'
      )
      .then((confirmed) => {
        if (confirmed) {
          this.categoriaRolService.agregarCategoriasARol(this.rolSeleccionado!.id, idsArray).subscribe({
            next: (resp: any) => {
              if (resp.success) {
                this.alertService.success(resp.message);
                this.cargarCategoriasPorRol(this.rolSeleccionado!.id);
              } else {
                this.alertService.error(resp.message);
              }
            },
            error: () => {
              this.alertService.error('Error al agregar las categorías');
            }
          });
        }
      });
  }

  quitarCategoriasSeleccionadas(): void {
    if (!this.rolSeleccionado) {
      this.alertService.error('Debe seleccionar un rol');
      return;
    }

    if (this.categoriasSeleccionadasAsignadas.size === 0) {
      this.alertService.error('Debe seleccionar al menos una categoría');
      return;
    }

    // Construir set final incluyendo hijas si se seleccionó un padre
    const idsIniciales = Array.from(this.categoriasSeleccionadasAsignadas);
    const idsFinalesSet = new Set<number>(idsIniciales);

    idsIniciales.forEach(id => {
      const categoria = this.encontrarCategoria(this.categoriasAsignadas, id);
      if (categoria && categoria.esPadre && categoria.subcategorias) {
        categoria.subcategorias.forEach(sub => {
          if (sub.id) idsFinalesSet.add(sub.id);
        });
      }
    });

    const idsArray = Array.from(idsFinalesSet);

    this.alertService
      .confirm(
        '¿Confirmar eliminación?',
        `Se quitarán ${idsArray.length} categoría(s) del rol "${this.rolSeleccionado.nombre}".`,
        'Sí, quitar',
        'Cancelar',
        'warning'
      )
      .then((confirmed) => {
        if (!confirmed) return;

        // Si el servicio tiene un endpoint para remover varias categorías de una sola vez:
        const servicioAny: any = this.categoriaRolService;
        if (typeof servicioAny.removerCategoriasDeRol === 'function') {
          servicioAny.removerCategoriasDeRol(this.rolSeleccionado!.id, idsArray).subscribe({
            next: (resp: any) => {
              if (resp && resp.success === false) {
                this.alertService.error(resp.message || 'No se pudieron quitar las categorías');
                return;
              }
              this.alertService.success(resp?.message || 'Categorías quitadas correctamente');
              this.categoriasSeleccionadasAsignadas.clear();
              this.cargarCategoriasPorRol(this.rolSeleccionado!.id);
            },
            error: () => {
              this.alertService.error('Error al quitar las categorías');
            }
          });
          return;
        }

        // Fallback: remover una por una usando forkJoin
        const observables = idsArray.map(id => this.categoriaRolService.removerCategoriaDeRol(this.rolSeleccionado!.id, id));
        forkJoin(observables).subscribe({
          next: (responses: any[]) => {
            // Si las respuestas traen success, comprobamos; si no, asumimos éxito si no hay error.
            const allOk = responses.every(r => r == null || r.success === undefined || r.success === true);
            if (allOk) {
              this.alertService.success('Categorías quitadas correctamente');
            } else {
              this.alertService.error('Algunas categorías no se quitaron correctamente');
            }
            this.categoriasSeleccionadasAsignadas.clear();
            this.cargarCategoriasPorRol(this.rolSeleccionado!.id);
          },
          error: () => {
            this.alertService.error('Error al quitar las categorías');
          }
        });
      });
  }

  quitarCategorias(categoriaIds: number[]): void {
  if (!this.rolSeleccionado) return;

  const nombreCategoria = this.encontrarCategoria(this.categoriasAsignadas, categoriaIds[0])?.nombre || 'categoría';
  const esPadre = categoriaIds.length > 1;
  const mensaje = esPadre 
    ? `Vas a quitar la categoría "${nombreCategoria}" y sus ${categoriaIds.length - 1} subcategoría(s) del rol "${this.rolSeleccionado.nombre}"`
    : `Vas a quitar la categoría "${nombreCategoria}" del rol "${this.rolSeleccionado.nombre}"`;

  this.alertService
    .confirm(
      '¿Estás seguro?',
      mensaje,
      'Sí, quitar',
      'Cancelar',
      'warning'
    )
    .then((confirmed) => {
      if (!confirmed) return;

      // Si el servicio tiene un endpoint para remover varias categorías de una sola vez:
      const servicioAny: any = this.categoriaRolService;
      if (typeof servicioAny.removerCategoriasDeRol === 'function') {
        servicioAny.removerCategoriasDeRol(this.rolSeleccionado!.id, categoriaIds).subscribe({
          next: (resp: any) => {
            if (resp && resp.success === false) {
              this.alertService.error(resp.message || 'No se pudieron quitar las categorías');
              return;
            }
            this.alertService.success(resp?.message || 'Categorías quitadas correctamente');
            this.cargarCategoriasPorRol(this.rolSeleccionado!.id);
          },
          error: () => {
            this.alertService.error('Error al quitar las categorías');
          }
        });
        return;
      }

      // Fallback: remover una por una usando forkJoin
      const observables = categoriaIds.map(id => this.categoriaRolService.removerCategoriaDeRol(this.rolSeleccionado!.id, id));
      forkJoin(observables).subscribe({
        next: (responses: any[]) => {
          const allOk = responses.every(r => r == null || r.success === undefined || r.success === true);
          if (allOk) {
            this.alertService.success('Categorías quitadas correctamente');
          } else {
            this.alertService.error('Algunas categorías no se quitaron correctamente');
          }
          this.cargarCategoriasPorRol(this.rolSeleccionado!.id);
        },
        error: () => {
          this.alertService.error('Error al quitar las categorías');
        }
      });
    });
}

  ngOnDestroy(): void {
    // Limpiar recursos si es necesario
  }
}