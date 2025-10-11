import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '../../services/alert-service';
import { Rol } from '../../interfaces/rol';
import { Menu } from '../../interfaces/menu';
import { RolMenuService } from '../../services/rol-menu-service';
import { RolService } from '../../services/rol-service';
import { MenuService } from '../../services/menu-service';

declare var $: any;

@Component({
  selector: 'app-configuracion-rol-menu',
  standalone: false,
  templateUrl: './configuracion-rol-menu.html',
  styleUrls: ['./configuracion-rol-menu.css']
})
export class ConfiguracionRolMenu implements OnInit, OnDestroy {

  roles: Rol[] = [];
  menusDisponibles: Menu[] = [];
  menusAsignados: Menu[] = [];
  rolSeleccionado: Rol | null = null;
  dataTableDisponibles: any;
  dataTableAsignados: any;

  menusSeleccionados: Set<number> = new Set();

  constructor(
    private rolMenuService: RolMenuService,
    private rolService: RolService,
    private menuService: MenuService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.cargarRoles();
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

  onRolChange(event: any): void {
    const rolId = parseInt(event.target.value);
    if (!rolId) {
      this.rolSeleccionado = null;
      this.menusDisponibles = [];
      this.menusAsignados = [];
      this.destruirDataTables();
      return;
    }

    this.rolSeleccionado = this.roles.find(r => r.id === rolId) || null;
    this.cargarMenusPorRol(rolId);
  }

  cargarMenusPorRol(rolId: number): void {
    this.menusSeleccionados.clear();
    
    this.rolMenuService.obtenerMenusPorRol(rolId).subscribe({
      next: (data: any) => {
        this.menusAsignados = data;
        this.inicializarDataTableAsignados();
      },
      error: (error: any) => {
        console.error('Error al cargar menús asignados:', error);
        this.alertService.error('Error al cargar menús asignados.');
      }
    });

    this.rolMenuService.obtenerMenusDisponibles(rolId).subscribe({
      next: (data: any) => {
        this.menusDisponibles = data;
        this.inicializarDataTableDisponibles();
      },
      error: (error: any) => {
        console.error('Error al cargar menús disponibles:', error);
        this.alertService.error('Error al cargar menús disponibles.');
      }
    });
  }

  inicializarDataTableDisponibles(): void {
    if (this.dataTableDisponibles) {
      this.dataTableDisponibles.destroy();
    }

    setTimeout(() => {
      this.dataTableDisponibles = $('#menusDisponiblesTable').DataTable({
        data: this.menusDisponibles,
        columns: [
          {
            data: null,
            orderable: false,
            className: 'text-center align-middle',
            render: (data: any, type: string, row: Menu): string => {
              return `<input type="checkbox" class="form-check-input menu-checkbox" data-id="${row.id}">`;
            }
          },
          {
            data: 'nombre',
            title: 'Nombre',
            render: (data: any, type: string, row: Menu): string => {
              return row.nombre;
            }
          },
          {
            data: 'url',
            title: 'URL',
            render: (data: any, type: string, row: Menu): string => {
              return row.url || 'Sin URL';
            }
          },
          {
            data: 'menuPadre',
            title: 'Menú Padre',
            render: (data: any, type: string, row: Menu): string => {
              return row.menuPadre ? row.menuPadre.nombre : 'Menú Principal';
            }
          },
          {
            data: null,
            orderable: false,
            className: 'text-center align-middle',
            render: (data: any, type: string, row: Menu): string => {
              return `
                <button class="btn btn-success btn-sm rounded-pill btn-agregar" data-id="${row.id}" title="Agregar">
                  <i class="bi bi-plus-circle me-1"></i>Agregar
                </button>
              `;
            }
          }
        ],
        language: this.getSpanishLanguage('menús disponibles'),
        pageLength: 5,
        pagingType: 'simple_numbers',
        responsive: true,
        dom: '<"d-flex justify-content-between align-items-center mb-3"<"dataTables_length"l><"dataTables_filter"f>>rt<"d-flex justify-content-between align-items-center"<"dataTables_info"i><"dataTables_paginate"p>>',
        drawCallback: this.customDrawCallback
      });

      $('#menusDisponiblesTable').on('click', '.btn-agregar', (e: any) => {
        const id = $(e.currentTarget).data('id');
        this.agregarMenu(id);
      });

      $('#menusDisponiblesTable').on('change', '.menu-checkbox', (e: any) => {
        const id = parseInt($(e.currentTarget).data('id'));
        if ($(e.currentTarget).is(':checked')) {
          this.menusSeleccionados.add(id);
        } else {
          this.menusSeleccionados.delete(id);
        }
      });
    }, 100);
  }

  inicializarDataTableAsignados(): void {
    if (this.dataTableAsignados) {
      this.dataTableAsignados.destroy();
    }

    setTimeout(() => {
      this.dataTableAsignados = $('#menusAsignadosTable').DataTable({
        data: this.menusAsignados,
        columns: [
          {
            data: 'nombre',
            title: 'Nombre',
            render: (data: any, type: string, row: Menu): string => {
              return row.nombre;
            }
          },
          {
            data: 'url',
            title: 'URL',
            render: (data: any, type: string, row: Menu): string => {
              return row.url || 'Sin URL';
            }
          },
          {
            data: 'menuPadre',
            title: 'Menú Padre',
            render: (data: any, type: string, row: Menu): string => {
              return row.menuPadre ? row.menuPadre.nombre : 'Menú Principal';
            }
          },
          {
            data: null,
            orderable: false,
            className: 'text-center align-middle',
            render: (data: any, type: string, row: Menu): string => {
              return `
                <button class="btn btn-danger btn-sm rounded-pill btn-quitar" data-id="${row.id}" title="Quitar">
                  <i class="bi bi-dash-circle me-1"></i>Quitar
                </button>
              `;
            }
          }
        ],
        language: this.getSpanishLanguage('menús asignados'),
        pageLength: 5,
        pagingType: 'simple_numbers',
        responsive: true,
        dom: '<"d-flex justify-content-between align-items-center mb-3"<"dataTables_length"l><"dataTables_filter"f>>rt<"d-flex justify-content-between align-items-center"<"dataTables_info"i><"dataTables_paginate"p>>',
        drawCallback: this.customDrawCallback
      });

      $('#menusAsignadosTable').on('click', '.btn-quitar', (e: any) => {
        const id = $(e.currentTarget).data('id');
        this.quitarMenu(id);
      });
    }, 100);
  }

  agregarMenu(menuId: number): void {
    if (!this.rolSeleccionado) return;

    this.rolMenuService.agregarMenu(this.rolSeleccionado.id, menuId).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.alertService.success(resp.message);
          this.cargarMenusPorRol(this.rolSeleccionado!.id);
        } else {
          this.alertService.error(resp.message);
        }
      },
      error: () => {
        this.alertService.error('Error al agregar el menú');
      }
    });
  }

  quitarMenu(menuId: number): void {
    if (!this.rolSeleccionado) return;

    const menu = this.menusAsignados.find(m => m.id === menuId);
    if (!menu) return;

    this.alertService
      .confirm(
        '¿Estás seguro?',
        `Vas a quitar el menú "${menu.nombre}" del rol "${this.rolSeleccionado.nombre}"`,
        'Sí, quitar',
        'Cancelar',
        'warning'
      )
      .then((confirmed) => {
        if (confirmed) {
          this.rolMenuService.quitarMenu(this.rolSeleccionado!.id, menuId).subscribe({
            next: (resp: any) => {
              if (resp.success) {
                this.alertService.success(resp.message);
                this.cargarMenusPorRol(this.rolSeleccionado!.id);
              } else {
                this.alertService.error(resp.message);
              }
            },
            error: () => {
              this.alertService.error('Error al quitar el menú');
            }
          });
        }
      });
  }

  asignarMenusSeleccionados(): void {
    if (!this.rolSeleccionado) {
      this.alertService.error('Debe seleccionar un rol');
      return;
    }

    if (this.menusSeleccionados.size === 0) {
      this.alertService.error('Debe seleccionar al menos un menú');
      return;
    }

    const menuIds = Array.from(this.menusSeleccionados);
    
    this.alertService
      .confirm(
        '¿Confirmar asignación?',
        `Se agregarán ${menuIds.length} menú(s) al rol "${this.rolSeleccionado.nombre}"`,
        'Sí, agregar',
        'Cancelar',
        'info'
      )
      .then((confirmed) => {
        if (confirmed) {
          let completados = 0;
          let errores = 0;

          menuIds.forEach(menuId => {
            this.rolMenuService.agregarMenu(this.rolSeleccionado!.id, menuId).subscribe({
              next: (resp: any) => {
                completados++;
                if (completados + errores === menuIds.length) {
                  if (errores === 0) {
                    this.alertService.success(`${completados} menú(s) agregado(s) correctamente`);
                  } else {
                    this.alertService.error(`${completados} menú(s) agregado(s), ${errores} con error(es)`);
                  }
                  this.cargarMenusPorRol(this.rolSeleccionado!.id);
                }
              },
              error: () => {
                errores++;
                if (completados + errores === menuIds.length) {
                  this.alertService.error(`${completados} menú(s) agregado(s), ${errores} con error(es)`);
                  this.cargarMenusPorRol(this.rolSeleccionado!.id);
                }
              }
            });
          });
        }
      });
  }

  getSpanishLanguage(tipo: string) {
    return {
      decimal: ",",
      emptyTable: `No hay ${tipo}`,
      info: `Mostrando _START_ a _END_ de _TOTAL_ registros`,
      infoEmpty: "Mostrando 0 a 0 de 0 registros",
      infoFiltered: "(filtrado de _MAX_ registros totales)",
      infoPostFix: "",
      thousands: ".",
      lengthMenu: "Mostrar _MENU_ registros",
      loadingRecords: "Cargando...",
      processing: "Procesando...",
      search: "Buscar:",
      zeroRecords: "No se encontraron registros coincidentes",
      paginate: {
        first: "Primero",
        last: "Último",
        next: "Siguiente",
        previous: "Anterior"
      },
      aria: {
        sortAscending: ": activar para ordenar la columna de manera ascendente",
        sortDescending: ": activar para ordenar la columna de manera descendente"
      }
    };
  }

  customDrawCallback() {
    $('.dataTables_wrapper .paginate_button').removeClass('btn btn-primary');
    $('.dataTables_wrapper .dataTables_length select').removeClass('form-control form-control-sm');
    $('.dataTables_wrapper .dataTables_filter input').removeClass('form-control form-control-sm');

    $('.dataTables_wrapper .dataTables_paginate').css({
      'display': 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      'margin-top': '10px'
    });

    $('.dataTables_wrapper .dataTables_paginate .paginate_button').css({
      'border': 'none',
      'background': 'none',
      'color': '#007bff',
      'padding': '5px 10px',
      'cursor': 'pointer'
    });

    $('.dataTables_wrapper .dataTables_paginate .paginate_button.current').css({
      'background-color': '#007bff',
      'color': '#fff',
      'border-radius': '5px'
    });

    $('.dataTables_wrapper .dataTables_paginate .paginate_button:hover').css({
      'background-color': '#f0f0f0'
    });
  }

  destruirDataTables(): void {
    if (this.dataTableDisponibles) {
      this.dataTableDisponibles.destroy();
      this.dataTableDisponibles = null;
    }
    if (this.dataTableAsignados) {
      this.dataTableAsignados.destroy();
      this.dataTableAsignados = null;
    }
  }

  ngOnDestroy(): void {
    this.destruirDataTables();
  }
}