import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RegisterFormValue } from "../models/register.form.value.model";
import { catchError, map, Observable, of } from "rxjs";
import { environment } from "../../../environments/environment";

export interface RegisterResponse {
  success: boolean;
  status: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  constructor(private http: HttpClient) { }

  register(formValue: RegisterFormValue): Observable<RegisterResponse> {
    return this.http.post(`${environment.apiUrl}/auth-register`, formValue).pipe(
      map(() => ({ success: true, status: 200 })),
      catchError((err) => of({
        success: false,
        status: err.status,
        message: err.error?.message || 'Erreur inconnue'
      }))
    );
  }

  checkAvailability(field: 'email' | 'phone', value: string): Observable<boolean> {
    return this.http.get<{ available: boolean }>(`${environment.apiUrl}/check-${field}?value=${value}`).pipe(
      map(res => res.available),
      catchError(() => of(true))
    );
  }
}
