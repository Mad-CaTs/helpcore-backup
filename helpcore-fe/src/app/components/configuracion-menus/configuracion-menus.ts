import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from '../../services/menu-service';
import { AlertService } from '../../services/alert-service';
import { Menu } from '../../interfaces/menu';

declare var $: any;

@Component({
  selector: 'app-configuracion-menus',
  standalone: false,
  templateUrl: './configuracion-menus.html',
  styleUrl: './configuracion-menus.css'
})
export class ConfiguracionMenus implements OnInit, OnDestroy {

  menus: Menu[] = [];
  dataTable: any;

  menuEditando: Menu | null = null;
  menuEditData: Partial<Menu> = {
    nombre: ''
  };

  constructor(private menuService: MenuService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.cargarMenus();
  }

  cargarMenus(): void {
    this.menuService.listar()
      .subscribe({
        next: (data) => {
          this.menus = data;
          this.inicializarDataTable();
        },
        error: (error) => {
          console.error('Error al cargar menús:', error);
          this.alertService.error('Error al cargar menús.');
        }
      });
  }

  abrirModalEditar(id: number): void {
    const menu = this.menus.find(m => m.id === id);
    if (!menu) return;

    this.menuEditando = { ...menu };
    this.menuEditData = {
      nombre: menu.nombre
    };

    ($('#editMenuModal') as any).modal('show');
  }

  inicializarDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    setTimeout(() => {
      this.dataTable = $('#menusTable').DataTable({
        data: this.menus,
        columns: [
          {
            data: 'nombre',
            title: 'Nombre',
            defaultContent: 'Sin nombre',
            render: (data: any, type: string, row: Menu): string => {
              return row.nombre;
            }
          },
          {
            data: 'url',
            title: 'URL',
            defaultContent: 'Sin URL',
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
            data: 'activo',
            className: 'text-center align-middle',
            render: (data: boolean): string => {
              return data
                ? '<span class="badge bg-success">Activo</span>'
                : '<span class="badge bg-danger">Inactivo</span>';
            }
          },
          {
            data: null,
            orderable: false,
            className: 'text-center align-middle',
            render: (data: any, type: string, row: Menu): string => {
              return `
                <div class="d-flex justify-content-center">
                  <button class="btn btn-light btn-sm rounded-circle btn-editar" data-id="${row.id}" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-light btn-sm rounded-circle btn-eliminar" data-id="${row.id}" title="Deshabilitar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              `;
            }
          }
        ],
        language: {
          decimal: ",",
          emptyTable: "No hay menús disponibles",
          info: "Mostrando _START_ a _END_ de _TOTAL_ menús",
          infoEmpty: "Mostrando 0 a 0 de 0 menús",
          infoFiltered: "(filtrado de _MAX_ menús totales)",
          infoPostFix: "",
          thousands: ".",
          lengthMenu: "Mostrar _MENU_ menús",
          loadingRecords: "Cargando...",
          processing: "Procesando...",
          search: "Buscar:",
          zeroRecords: "No se encontraron menús coincidentes",
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
        },
        pageLength: 10,
        pagingType: 'simple_numbers',
        responsive: true,
        dom: '<"d-flex justify-content-between align-items-center mb-3"<"dataTables_length"l><"dataTables_filter"f>>rt<"d-flex justify-content-between align-items-center"<"dataTables_info"i><"dataTables_paginate"p>>',
        drawCallback: function () {
          // Remove Bootstrap classes
          $('.dataTables_wrapper .paginate_button').removeClass('btn btn-primary');
          $('.dataTables_wrapper .dataTables_length select').removeClass('form-control form-control-sm');
          $('.dataTables_wrapper .dataTables_filter input').removeClass('form-control form-control-sm');

          // Add custom styles for pagination
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
      });

      $('#menusTable').on('click', '.btn-editar', (e: any) => {
        const id = $(e.currentTarget).data('id');
        this.abrirModalEditar(id);
      });

      $('#menusTable').on('click', '.btn-eliminar', (e: any) => {
        const id = $(e.currentTarget).data('id');
        this.confirmarEliminarMenu(id);
      });
    }, 100);
  }

  guardarEdicion(): void {
    if (!this.menuEditando || !this.menuEditData.nombre) {
      this.alertService.error('Debe completar el nombre del menú');
      return;
    }

    const menuActualizado: Menu = {
      ...this.menuEditando,
      nombre: this.menuEditData.nombre
    };

    this.menuService.actualizarMenu(menuActualizado).subscribe({
      next: (menu) => {
        this.alertService.success('Menú actualizado correctamente');
        this.cargarMenus();
        this.cerrarModalEdicion();
      },
      error: (error) => {
        this.alertService.error('Error al actualizar el menú');
      }
    });
  }

  cerrarModalEdicion(): void {
    this.menuEditando = null;
    this.menuEditData = { nombre: '' };
    ($('#editMenuModal') as any).modal('hide');
  }

  confirmarEliminarMenu(id: number): void {
    const menu = this.menus.find(m => m.id === id);
    if (!menu) return;

    this.alertService
      .confirm(
        '¿Estás seguro?',
        `Vas a deshabilitar el menú "${menu.nombre}"`,
        'Sí, deshabilitar',
        'Cancelar',
        'warning'
      )
      .then((confirmed) => {
        if (confirmed) {
          this.eliminarMenu(id);
        }
      });
  }

  eliminarMenu(id: number): void {
    this.menuService.eliminarMenu(id).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.alertService.success(resp.message);
          this.cargarMenus();
        } else {
          this.alertService.error(resp.message);
        }
      },
      error: (err) => {
        this.alertService.error('Error al deshabilitar el menú');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}