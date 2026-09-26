import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './doctor/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'doctor/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];