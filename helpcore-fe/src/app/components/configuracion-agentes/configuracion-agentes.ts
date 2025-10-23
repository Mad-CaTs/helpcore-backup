import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../services/alert-service';
import { Usuario } from '../../interfaces/usuario';
import { AgenteService } from '../../services/agente-service';

declare var $: any;

@Component({
  selector: 'app-configuracion-agentes',
  standalone: false,
  templateUrl: './configuracion-agentes.html',
  styleUrl: './configuracion-agentes.css'
})
export class ConfiguracionAgentesComponent implements OnInit, OnDestroy {

  agentes: Usuario[] = [];
  dataTable: any;
  formularioAgente: FormGroup;
  
  modoEdicion: boolean = false;
  guardando: boolean = false;
  agenteActualId: number | null = null;
  agenteADeshabilitarId: number | null = null;
  agenteADeshabilitarNombre: string = '';

  constructor(
    private agenteService: AgenteService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.formularioAgente = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarAgentes();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono: ['', []],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.minLength(6)]],
      activo: [true]
    });
  }

  cargarAgentes(): void {
    this.agenteService.listarAgentes()
      .subscribe({
        next: (data) => {
          this.agentes = data;
          this.inicializarDataTable();
        },
        error: (error) => {
          console.error('Error al cargar agentes:', error);
          this.alertService.error('Error al cargar agentes.');
        }
      });
  }

  inicializarDataTable(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    setTimeout(() => {
      this.dataTable = $('#agentesTable').DataTable({
        data: this.agentes,
        columns: [
          {
            data: null,
            title: 'Nombre Completo',
            render: (data: any, type: string, row: Usuario): string => {
              return `${row.persona.nombres} ${row.persona.apellidos}`;
            }
          },
          {
            data: 'persona.dni',
            title: 'DNI'
          },
          {
            data: 'correo',
            title: 'Correo'
          },
          {
            data: 'persona.telefono',
            title: 'Teléfono',
            render: (data: any): string => {
              return data || '-';
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
                <div class="d-flex justify-content-center gap-2">
                  <button class="btn btn-light btn-sm rounded-circle btn-editar-agente" 
                          data-id="${row.id}" 
                          title="Editar agente">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-light btn-sm rounded-circle btn-deshabilitar-agente" 
                          data-id="${row.id}" 
                          data-nombre="${row.persona.nombres} ${row.persona.apellidos}"
                          title="Deshabilitar agente"
                          ${!row.activo ? 'disabled' : ''}>
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              `;
            }
          }
        ],
        language: {
          decimal: ",",
          emptyTable: "No hay agentes disponibles",
          info: "Mostrando _START_ a _END_ de _TOTAL_ agentes",
          infoEmpty: "Mostrando 0 a 0 de 0 agentes",
          infoFiltered: "(filtrado de _MAX_ agentes totales)",
          thousands: ".",
          lengthMenu: "Mostrar _MENU_ agentes",
          loadingRecords: "Cargando...",
          processing: "Procesando...",
          search: "Buscar:",
          zeroRecords: "No se encontraron agentes coincidentes",
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
        drawCallback: () => {
          this.aplicarEstilosDataTable();
        }
      });

      $('#agentesTable').on('click', '.btn-editar-agente', (e: any) => {
        const id = $(e.currentTarget).data('id');
        this.abrirModalEditar(id);
      });

      $('#agentesTable').on('click', '.btn-deshabilitar-agente', (e: any) => {
        const id = $(e.currentTarget).data('id');
        const nombre = $(e.currentTarget).data('nombre');
        this.abrirModalDeshabilitar(id, nombre);
      });
    }, 100);
  }

  aplicarEstilosDataTable(): void {
    $('.dataTables_wrapper .paginate_button').removeClass('btn btn-primary');
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
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.agenteActualId = null;
    this.formularioAgente.reset();
    this.formularioAgente.get('contrasena')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.formularioAgente.get('contrasena')?.updateValueAndValidity();
    ($('#editAgenteModal') as any).modal('show');
  }

  abrirModalEditar(id: number): void {
    const agente = this.agentes.find(a => a.id === id);
    if (!agente) return;

    this.modoEdicion = true;
    this.agenteActualId = id;
    
    this.formularioAgente.patchValue({
      nombres: agente.persona.nombres,
      apellidos: agente.persona.apellidos,
      dni: agente.persona.dni,
      telefono: agente.persona.telefono,
      correo: agente.correo,
      activo: agente.activo
    });

    this.formularioAgente.get('contrasena')?.clearValidators();
    this.formularioAgente.get('contrasena')?.updateValueAndValidity();

    ($('#editAgenteModal') as any).modal('show');
  }

  abrirModalDeshabilitar(id: number, nombre: string): void {
    this.agenteADeshabilitarId = id;
    this.agenteADeshabilitarNombre = nombre;
    ($('#confirmarDeshabilitarModal') as any).modal('show');
  }

  guardarAgente(): void {
    if (!this.formularioAgente.valid) {
      this.alertService.error('Por favor, complete todos los campos requeridos');
      return;
    }

    this.guardando = true;
    const datos = this.formularioAgente.value;

    if (this.modoEdicion && this.agenteActualId) {
      this.agenteService.editarAgente(this.agenteActualId, datos)
        .subscribe({
          next: () => {
            this.alertService.success('Agente actualizado correctamente');
            this.cargarAgentes();
            this.cerrarModal();
            this.guardando = false;
          },
          error: (error) => {
            console.error('Error al actualizar agente:', error);
            this.alertService.error(error.error?.message || 'Error al actualizar agente');
            this.guardando = false;
          }
        });
    } else {
      this.agenteService.crearAgente(datos)
        .subscribe({
          next: () => {
            this.alertService.success('Agente creado correctamente');
            this.cargarAgentes();
            this.cerrarModal();
            this.guardando = false;
          },
          error: (error) => {
            console.error('Error al crear agente:', error);
            this.alertService.error(error.error?.message || 'Error al crear agente');
            this.guardando = false;
          }
        });
    }
  }

  confirmarDeshabilitar(): void {
    if (!this.agenteADeshabilitarId) return;

    this.guardando = true;
    this.agenteService.deshabilitarAgente(this.agenteADeshabilitarId)
      .subscribe({
        next: () => {
          this.alertService.success('Agente deshabilitado correctamente');
          this.cargarAgentes();
          ($('#confirmarDeshabilitarModal') as any).modal('hide');
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al deshabilitar agente:', error);
          this.alertService.error('Error al deshabilitar agente');
          this.guardando = false;
        }
      });
  }

  cerrarModal(): void {
    this.formularioAgente.reset();
    this.modoEdicion = false;
    this.agenteActualId = null;
    ($('#editAgenteModal') as any).modal('hide');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formularioAgente.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}