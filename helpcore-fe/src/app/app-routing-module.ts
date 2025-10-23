import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Inicio } from './components/inicio/inicio';
import { Ticket } from './components/ticket/ticket';
import { ConsultarEstado } from './components/consultar-estado/consultar-estado';
import { Register } from './components/register/register';
import { ConfiguracionAdmin } from './components/configuracion-admin/configuracion-admin';
import { ConfiguracionRoles } from './components/configuracion-roles/configuracion-roles';
import { ConfiguracionMenus } from './components/configuracion-menus/configuracion-menus';
import { ConfiguracionRolMenu } from './components/configuracion-rol-menu/configuracion-rol-menu';
import { ConfiguracionRolesUsuario } from './components/configuracion-roles-usuario/configuracion-roles-usuario';
import { Dashboard } from './components/dashboard/dashboard';
import { ConfiguracionCategoriasTicket } from './components/configuracion-categorias-ticket/configuracion-categorias-ticket';
import { ConfiguracionCategoriaRoles } from './components/configuracion-categoria-roles/configuracion-categoria-roles';
import { AuthGuard } from './guard/auth-guard';
import { RoleGuard } from './guard/role-guard';
import { ConfiguracionAgentesComponent } from './components/configuracion-agentes/configuracion-agentes';
import { VerTicketComponent } from './components/ver-ticket/ver-ticket';


const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'consultar-estado', component: ConsultarEstado },
  
  { 
    path: 'ticket', 
    component: Ticket,
  },
  { 
    path: 'ver-ticket', 
    component: VerTicketComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [AuthGuard]
  },
  { 
    path: 'configuracion', 
    component: ConfiguracionAdmin,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  { 
    path: 'configuracion/roles',
    component: ConfiguracionRoles,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  { 
    path: 'configuracion/menus',
    component: ConfiguracionMenus,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  { 
    path: 'configuracion/rol-menu',
    component: ConfiguracionRolMenu,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  { 
    path: 'configuracion/roles-usuario', 
    component: ConfiguracionRolesUsuario,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  { 
    path: 'configuracion/categoria-ticket', 
    component: ConfiguracionCategoriasTicket,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  { 
    path: 'configuracion/categoria-roles', 
    component: ConfiguracionCategoriaRoles,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  { 
    path: 'configuracion/agentes', 
    component: ConfiguracionAgentesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },

  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }