import { Routes } from '@angular/router';
import { LandingPageComponent } from './core/components/landing-page-component/landing-page-component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: LandingPageComponent
  }

];
