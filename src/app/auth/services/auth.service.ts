import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(emailOrPhone: string, password: string): Observable<{ accessToken: string, refreshToken?: string }> {
    return this.http.post<{ accessToken: string, refreshToken?: string }>(`${this.base}/login`, { emailOrPhone, password })
      .pipe(
        tap(res => {
          this.tokenService.setAccessToken(res.accessToken, true);
          if (res.refreshToken) this.tokenService.setRefreshToken(res.refreshToken);
        })
      );
  }

  logout(): Observable<unknown> {
    // Option: call backend to invalidate refresh token (server-side)
    return this.http.post(`${this.base}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.clear();
      })
    );
  }

  refresh(): Observable<{ accessToken: string, refreshToken?: string }> {
    // If using HttpOnly cookie: backend reads cookie, returns new access token (and may set new cookie)
    // If not using cookie: send refreshToken in body
    const refreshToken = this.tokenService.getRefreshToken();
    if (this.tokenService.useHttpOnlyRefreshCookie) {
      return this.http.post<{ accessToken: string }>(`${this.base}/refresh`, {}).pipe(
        tap(res => {
          // met à jour l’access token en localStorage
          this.tokenService.setAccessToken(res.accessToken, true);
        })
      );
    } else {
      return this.http.post<{ accessToken: string, refreshToken?: string }>(`${this.base}/refresh`, { refreshToken })
        .pipe(
          tap(res => {
            this.tokenService.setAccessToken(res.accessToken, true);
            if (res.refreshToken) this.tokenService.setRefreshToken(res.refreshToken);
          })
        );
    }
  }
}
