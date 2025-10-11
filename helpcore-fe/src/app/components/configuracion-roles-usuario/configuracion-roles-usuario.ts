import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '../../services/alert-service';
import { Usuario } from '../../interfaces/usuario';
import { Rol } from '../../interfaces/rol';
import { UsuarioRolService } from '../../services/usuario-rol-service';
import { RolService } from '../../services/rol-service';

declare var $: any;

@Component({
  selector: 'app-configuracion-roles-usuario',
  standalone: false,
  templateUrl: './configuracion-roles-usuario.html',
  styleUrl: './configuracion-roles-usuario.css'
})
export class ConfiguracionRolesUsuario implements OnInit, OnDestroy {

  usuarios: Usuario[] = [];
  rolesDisponibles: Rol[] = [];
  dataTable: any;

  usuarioSeleccionado: Usuario | null = null;
  rolesSeleccionados: number[] = [];

  constructor(
    private usuarioRolService: UsuarioRolService,
    private rolService: RolService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.usuarioRolService.listarUsuariosConRoles()
      .subscribe({
        next: (data) => {
          this.usuarios = data;
          this.inicializarDataTable();
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
          this.alertService.error('Error al cargar usuarios.');
        }
      });
  }

  cargarRoles(): void {
    this.rolService.listarRoles()
      .subscribe({
        next: (data) => {
          this.rolesDisponibles = data.filter(r => r.activo);
        },
        error: (error) => {
          console.error('Error al cargar roles:', error);
          this.alertService.error('Error al cargar roles disponibles.');
        }
      });
  }

  inicializarDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    setTimeout(() => {
      this.dataTable = $('#usuariosTable').DataTable({
        data: this.usuarios,
        columns: [
          {
            data: null,
            title: 'Nombre Completo',
            render: (data: any, type: string, row: Usuario): string => {
              return `${row.nombres} ${row.apellidos}`;
            }
          },
          {
            data: 'dni',
            title: 'DNI'
          },
          {
            data: 'codigoAlumno',
            title: 'Código Alumno'
          },
          {
            data: 'correo',
            title: 'Correo'
          },
          {
            data: 'roles',
            title: 'Roles Asignados',
            render: (data: Rol[]): string => {
              if (!data || data.length === 0) {
                return '<span class="badge bg-secondary">Sin roles</span>';
              }
              return data
                .map(rol => `<span class="badge bg-primary me-1">${rol.nombre}</span>`)
                .join('');
            }
          },
          {
            data: 'activo',
            className: 'text-center align-middle',
            title: 'Estado',
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
            title: 'Acciones',
            render: (data: any, type: string, row: Usuario): string => {
              return `
                <div class="d-flex justify-content-center">
                  <button class="btn btn-light btn-sm rounded-circle btn-editar-roles" 
                          data-id="${row.id}" 
                          title="Editar roles">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                </div>
              `;
            }
          }
        ],
        language: {
          decimal: ",",
          emptyTable: "No hay usuarios disponibles",
          info: "Mostrando _START_ a _END_ de _TOTAL_ usuarios",
          infoEmpty: "Mostrando 0 a 0 de 0 usuarios",
          infoFiltered: "(filtrado de _MAX_ usuarios totales)",
          infoPostFix: "",
          thousands: ".",
          lengthMenu: "Mostrar _MENU_ usuarios",
          loadingRecords: "Cargando...",
          processing: "Procesando...",
          search: "Buscar:",
          zeroRecords: "No se encontraron usuarios coincidentes",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
          }
        },
        pageLength: 10,
        pagingType: 'simple_numbers',
        responsive: true,
        dom: '<"d-flex justify-content-between align-items-center mb-3"<"dataTables_length"l><"dataTables_filter"f>>rt<"d-flex justify-content-between align-items-center"<"dataTables_info"i><"dataTables_paginate"p>>',
        drawCallback: function () {
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
      });

      $('#usuariosTable').on('click', '.btn-editar-roles', (e: any) => {
        const id = $(e.currentTarget).data('id');
        this.abrirModalEditarRoles(id);
      });
    }, 100);
  }

  abrirModalEditarRoles(id: number): void {
    const usuario = this.usuarios.find(u => u.id === id);
    if (!usuario) return;

    this.usuarioSeleccionado = { ...usuario };
    this.rolesSeleccionados = usuario.roles ? usuario.roles.map(r => r.id) : [];

    ($('#editRolesModal') as any).modal('show');
  }

  toggleRol(idRol: number): void {
    const index = this.rolesSeleccionados.indexOf(idRol);
    if (index > -1) {
      this.rolesSeleccionados.splice(index, 1);
    } else {
      this.rolesSeleccionados.push(idRol);
    }
  }

  isRolSeleccionado(idRol: number): boolean {
    return this.rolesSeleccionados.includes(idRol);
  }

  guardarRoles(): void {
    if (!this.usuarioSeleccionado) {
      this.alertService.error('No hay usuario seleccionado');
      return;
    }

    this.usuarioRolService.editarRoles(this.usuarioSeleccionado.id, this.rolesSeleccionados)
      .subscribe({
        next: (usuario) => {
          this.alertService.success('Roles actualizados correctamente');
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar roles:', error);
          this.alertService.error('Error al actualizar roles');
        }
      });
  }

  cerrarModal(): void {
    this.usuarioSeleccionado = null;
    this.rolesSeleccionados = [];
    ($('#editRolesModal') as any).modal('hide');
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}