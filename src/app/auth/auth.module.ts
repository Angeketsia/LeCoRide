import { NgModule } from "@angular/core";
import { RegisterFormComponent } from "./components/register-form-component/register-form-component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared-module";
import { authRoutingModule } from "./auth.routing.module";
import { RegisterService } from "./services/register.service";
import { ɵInternalFormsSharedModule } from "@angular/forms";
import { OtpVerifyComponent } from "./components/verify/otp-verify-component/otp-verify-component";
import { EmailVerifyComponent } from "./components/verify/email-verify-component/email-verify-component";
import { LoginComponent } from "./components/login-component/login-component";
import { DashboardComponent } from "./components/dashboard-component/dashboard-component";


@NgModule({
  declarations: [
    RegisterFormComponent,
    OtpVerifyComponent,
    EmailVerifyComponent,
    LoginComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    authRoutingModule,
    ɵInternalFormsSharedModule
],
  exports: [
    RegisterFormComponent,
    OtpVerifyComponent,
    EmailVerifyComponent,
    LoginComponent,
    DashboardComponent
  ],
  providers: [
    RegisterService
  ]
})
export class AuthModule {}
