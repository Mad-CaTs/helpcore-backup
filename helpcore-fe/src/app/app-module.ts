import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HttpClientModule } from '@angular/common/http';
import { Login } from './components/login/login';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Inicio } from './components/inicio/inicio';
import { NavBar } from './components/common/nav-bar/nav-bar';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { Ticket } from './components/ticket/ticket';
import { ConsultarEstado } from './components/consultar-estado/consultar-estado';
import { Register } from './components/register/register';
import { DashboardAgente } from './components/dashboard-agente/dashboard-agente';
import { ConfiguracionAdmin } from './components/configuracion-admin/configuracion-admin';
import { ConfiguracionRoles } from './components/configuracion-roles/configuracion-roles';
import { ConfiguracionMenus } from './components/configuracion-menus/configuracion-menus';
import { ConfiguracionRolMenu } from './components/configuracion-rol-menu/configuracion-rol-menu';
import { ConfiguracionRolesUsuario } from './components/configuracion-roles-usuario/configuracion-roles-usuario';


@NgModule({
  declarations: [
    App,
    Login,
    Inicio,
    NavBar,
    Ticket,
    ConsultarEstado,
    Register,
    DashboardAgente,
    ConfiguracionAdmin,
    ConfiguracionRoles,
    ConfiguracionMenus,
    ConfiguracionRolMenu,
    ConfiguracionRolesUsuario
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }