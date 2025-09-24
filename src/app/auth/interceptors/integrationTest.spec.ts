import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('Integration: AuthInterceptor + AuthService refresh flow', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        TokenService,
        AuthService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    tokenService = TestBed.inject(TokenService);

    tokenService.clear();
    tokenService.setAccessToken('oldToken');
  });

  afterEach(() => {
    httpMock.verify();
  });

    it('should refresh token on 401 and retry original request', () => {
    // Spy sur la méthode refresh pour renvoyer un observable avec nouveau token
    spyOn(authService, 'refresh').and.returnValue(of({ accessToken: 'newToken' }));

    let response: any;
    http.get('/protected').subscribe(res => response = res);

    // première requête -> 401
    const req1 = httpMock.expectOne('/protected');
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });

    // refresh token appelé
    expect(authService.refresh).toHaveBeenCalled();

    // requête originale réessayée avec le nouveau token
    const req2 = httpMock.expectOne('/protected');
    expect(req2.request.headers.get('Authorization')).toBe('Bearer newToken');

    req2.flush({ success: true });

    expect(response).toEqual({ success: true });
    expect(tokenService.getAccessToken()).toBe('newToken');
  });

    it('should logout if refresh fails', () => {
    spyOn(authService, 'refresh').and.returnValue(
      of().pipe(() => { throw { status: 401 }; })
    );

    let errorResponse: any;
    http.get('/protected').subscribe({
      next: () => {},
      error: err => errorResponse = err
    });

    const req1 = httpMock.expectOne('/protected');
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });

    // token doit être vidé
    expect(tokenService.getAccessToken()).toBeNull();
    expect(errorResponse.status).toBe(401);
    });
  
});
