import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.Login)
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./features/admin/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'client-dashboard',
    loadComponent: () => import('./features/client/client-dashboard').then(m => m.ClientDashboard),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
