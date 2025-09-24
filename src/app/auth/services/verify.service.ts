import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RegisterFormValue } from "../models/register.form.value.model";
import { catchError, map, Observable, of } from "rxjs";
import { environment } from "../../../environments/environment";
import { AppModule } from "../../app.module";

@Injectable({
  providedIn: 'root'
})

export class VerifyService {

  constructor(private http: HttpClient) { }

  sendOtp(phone: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/verify/sendOtp`, { phone });
  }
  verifyOtp(phone: string, code: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/verify/otp`, { phone, code });
  }

  resendOtp(phone: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/resend/otp`, { phone });
  }


  sendVerificationEmail(email: string) {
    return this.http.post(`${environment.apiUrl}/verify/sendEmail`, { email });
  }

  verifyEmail(token: string) {
    return this.http.post(`${environment.apiUrl}/verify/email`, { token });
  }

  resendEmail(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/resend/email`, { email });
  }

}
