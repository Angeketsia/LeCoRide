import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})

export class VerifyService {

  constructor(private http: HttpClient) { }

  sendOtp(phone: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/verify/sendOtp`, { phone });
  }

  verifyOtp(phone: string, code: string): Observable<{ status: 'success' | 'failed'; message?: string }> {
  return this.http.post<{ status: 'success' | 'failed'; message?: string }>(
    `${environment.apiUrl}/verify/otp`,
    { phone, code }
  );
}


  resendOtp(phone: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/resend/otp`, { phone });
  }


  sendVerificationEmail(email: string) {
    return this.http.post(`${environment.apiUrl}/verify/sendEmail`, { email });
  }

  verifyEmail(token: string): Observable<{ status: 'success' | 'expired' | 'invalid'; message?: string }> {
    return this.http.post<{ status: 'success' | 'expired' | 'invalid'; message?: string }>('api/verify-email', { token });
  }


  resendEmail(email: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/resend/email`, { email });
  }

}
