import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterFormComponent } from './components/register-form-component/register-form-component';
import { EmailVerifyComponent } from './components/verify/email-verify-component/email-verify-component';
import { OtpVerifyComponent } from './components/verify/otp-verify-component/otp-verify-component';
import { LoginComponent } from './components/login-component/login-component';
import { DashboardComponent } from './components/dashboard-component/dashboard-component';

const routes: Routes = [
  {
    path: 'register',
    component: RegisterFormComponent
  },
  {
    path: 'otp',
    component: OtpVerifyComponent
  },
  {
    path: 'email',
    component: EmailVerifyComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class authRoutingModule { }
