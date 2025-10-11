import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Inicio } from './components/inicio/inicio';
import { Ticket } from './components/ticket/ticket';
import { ConsultarEstado } from './components/consultar-estado/consultar-estado';
import { Register } from './components/register/register';
import { DashboardAgente } from './components/dashboard-agente/dashboard-agente';
import { ConfiguracionAdmin } from './components/configuracion-admin/configuracion-admin';
import { ConfiguracionRoles } from './components/configuracion-roles/configuracion-roles';
import { ConfiguracionMenus } from './components/configuracion-menus/configuracion-menus';
import { ConfiguracionRolMenu } from './components/configuracion-rol-menu/configuracion-rol-menu';
import { ConfiguracionRolesUsuario } from './components/configuracion-roles-usuario/configuracion-roles-usuario';

const routes: Routes = [
  {path: 'inicio', component: Inicio},
  {path: '',  redirectTo:'inicio' , pathMatch:'full'},
  {path: 'login', component: Login},
  {path: 'ticket', component: Ticket},
  {path: 'consultar-estado', component: ConsultarEstado},
  {path: 'register', component: Register},
  {path: 'dashboard-agente', component: DashboardAgente},
  {path: 'configuracion', component: ConfiguracionAdmin},
  {path: 'configuracion/roles',component: ConfiguracionRoles},
  {path: 'configuracion/menus',component: ConfiguracionMenus},
  {path: 'configuracion/rol-menu',component: ConfiguracionRolMenu},
  {path: 'configuracion/roles-usuario', component:ConfiguracionRolesUsuario}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
