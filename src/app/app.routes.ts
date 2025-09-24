import { Routes } from '@angular/router';
import { RegisterFormComponent } from './auth/components/register-form-component/register-form-component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: RegisterFormComponent
  }

];
