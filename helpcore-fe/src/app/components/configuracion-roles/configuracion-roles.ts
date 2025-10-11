import { Component, OnInit, OnDestroy } from '@angular/core';
import { RolService } from '../../services/rol-service';
import { AlertService } from '../../services/alert-service';


declare var $: any;

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
  menus?: any[];
}

@Component({
  selector: 'app-configuracion-roles',
  standalone: false,
  templateUrl: './configuracion-roles.html',
  styleUrl: './configuracion-roles.css'
})
export class ConfiguracionRoles implements OnInit, OnDestroy {

  roles: Rol[] = [];
  dataTable: any;

  nuevoRol: Partial<Rol> = {
    nombre: '',
    descripcion: ''
  };

  rolEditando: Rol | null = null;
  rolEditData: Partial<Rol> = {
    nombre: '',
    descripcion: ''
  };

  constructor(private rolService: RolService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.rolService.listarRoles()
      .subscribe({
        next: (data) => {
          this.roles = data;
          this.inicializarDataTable();
        },
        error: (error) => {
          console.error('Error al cargar roles:', error);
          this.alertService.error('Error al cargar roles.');
        }
      });
  }

  abrirModalEditar(id: number): void {
    const rol = this.roles.find(r => r.id === id);
    if (!rol) return;

    this.rolEditando = { ...rol };
    this.rolEditData = {
      nombre: rol.nombre,
      descripcion: rol.descripcion
    };

    ($('#editRoleModal') as any).modal('show');
  }

  inicializarDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    setTimeout(() => {
      this.dataTable = $('#rolesTable').DataTable({
        data: this.roles,
        columns: [
          {
            data: 'nombre',
            title: 'Rol',
            defaultContent: 'Sin nombre',
            render: (data: any, type: string, row: Rol): string => {
              return row.nombre;
            }
          },
          {
            data: 'descripcion',
            defaultContent: 'Sin descripción'
          },
          {
            data: null,
            className: 'text-center',
            render: (data: any, type: string, row: Rol): string => {
              const cantidadMenus = row.menus ? row.menus.length : 0;
              return cantidadMenus.toString();
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
            render: (data: any, type: string, row: Rol): string => {
              return `
                <div class="d-flex justify-content-center">
                  <button class="btn btn-light btn-sm rounded-circle btn-editar" data-id="${row.id}" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-light btn-sm rounded-circle btn-eliminar" data-id="${row.id}" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              `;
            }
          }
        ],
        language: {
          decimal: ",",
          emptyTable: "No hay roles disponibles",
          info: "Mostrando _START_ a _END_ de _TOTAL_ roles",
          infoEmpty: "Mostrando 0 a 0 de 0 roles",
          infoFiltered: "(filtrado de _MAX_ roles totales)",
          infoPostFix: "",
          thousands: ".",
          lengthMenu: "Mostrar _MENU_ roles",
          loadingRecords: "Cargando...",
          processing: "Procesando...",
          search: "Buscar:",
          zeroRecords: "No se encontraron roles coincidentes",
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

      $('#rolesTable').on('click', '.btn-editar', (e: any) => {
        const id = $(e.currentTarget).data('id');
        this.abrirModalEditar(id);
      });

      $('#rolesTable').on('click', '.btn-eliminar', (e: any) => {
        const id = $(e.currentTarget).data('id');
        this.confirmarEliminarRol(id);
      });
    }, 100);
  }




  guardarEdicion(): void {
    if (!this.rolEditando || !this.rolEditData.nombre || !this.rolEditData.descripcion) {
      this.alertService.error('Debe completar nombre y descripción');
      return;
    }

    const rolActualizado: Rol = {
      ...this.rolEditando,
      nombre: this.rolEditData.nombre,
      descripcion: this.rolEditData.descripcion
    };

    this.rolService.actualizarRol(rolActualizado).subscribe({
      next: (rol) => {
        this.alertService.success('Rol actualizado correctamente');
        this.cargarRoles();
        this.cerrarModalEdicion();
      },
      error: (error) => {
        this.alertService.error('Error al actualizar el rol');
      }
    });
  }

  cerrarModalEdicion(): void {
    this.rolEditando = null;
    this.rolEditData = { nombre: '', descripcion: '' };
    ($('#editRoleModal') as any).modal('hide');
  }

  gestionarPermisos(id: number): void {
    console.log('Gestionar permisos del rol:', id);
    const rol = this.roles.find(r => r.id === id);
    if (rol) {
      // Aquí implementarías la lógica para gestionar permisos
      console.log('Permisos del rol:', rol.menus);
    }
  }
  confirmarEliminarRol(id: number): void {
    const rol = this.roles.find(r => r.id === id);
    if (!rol) return;

    this.alertService
      .confirm(
        '¿Estás seguro?',
        `Vas a deshabilitar el rol "${rol.nombre}"`,
        'Sí, eliminar',
        'Cancelar',
        'warning'
      )
      .then((confirmed) => {
        if (confirmed) {
          this.eliminarRol(id);
        }
      });
  }

  eliminarRol(id: number): void {
    this.rolService.eliminarRol(id).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.alertService.success(resp.message);
          this.cargarRoles();
        } else {
          this.alertService.error(resp.message);
        }
      },
      error: (err) => {
        this.alertService.error('Error al eliminar el rol');
      }
    });
  }

  guardarRol(): void {
    if (!this.nuevoRol.nombre || !this.nuevoRol.descripcion) {
      this.alertService.error('Debe ingresar nombre y descripción');
      return;
    }

    this.rolService.crearRol(this.nuevoRol).subscribe({
      next: (rolCreado) => {
        this.alertService.success("Rol creado correctamente");
        this.cargarRoles();
        this.nuevoRol = { nombre: '', descripcion: '' };
        ($('#addRoleModal') as any).modal('hide');
      },
      error: (error) => {
        this.alertService.error('Error al crear rol');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}