import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let tokenService: TokenService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        TokenService,
        AuthService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    tokenService = TestBed.inject(TokenService);
    authService = TestBed.inject(AuthService);

    tokenService.clear();
  });

  it('should add Authorization header', () => {
    tokenService.setAccessToken('abc123');

    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('should handle 401 by calling refresh', () => {
    spyOn(authService, 'refresh').and.returnValue(of({ accessToken: 'newToken' }));

    tokenService.setAccessToken('oldToken');

    http.get('/test').subscribe();

    const req1 = httpMock.expectOne('/test');
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });

    const req2 = httpMock.expectOne('/test'); // retried request
    expect(req2.request.headers.get('Authorization')).toBe('Bearer newToken');
    req2.flush({});
  });
});
