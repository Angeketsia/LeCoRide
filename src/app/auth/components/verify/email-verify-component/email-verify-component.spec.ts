import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EmailVerifyComponent } from './email-verify-component';
import { VerifyService } from '../../../services/verify.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from './../../../../shared/shared-module';
import { MockTranslatePipe } from './../../../pipes/mock-translate.pipe';

describe('EmailVerifyComponent', () => {
  let component: EmailVerifyComponent;
  let fixture: ComponentFixture<EmailVerifyComponent>;
  let verifyService: jasmine.SpyObj<VerifyService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    verifyService = jasmine.createSpyObj('VerifyService', ['verifyEmail', 'resendEmail']);
     verifyService.verifyEmail.and.returnValue(of({ status: 'success' })); // <--- valeur par défaut
  verifyService.resendEmail.and.returnValue(of({}));
    translateService = jasmine.createSpyObj('TranslateService', ['instant']);
    translateService.instant.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      declarations: [EmailVerifyComponent],
      providers: [
      TranslateService,
        { provide: VerifyService, useValue: verifyService },
        { provide: TranslateService, useValue: translateService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => 'mock-token' } },
            queryParams: of({ email: 'test@example.com' })
          }
        }
      ],
      imports: [SharedModule, TranslateModule.forRoot(), MockTranslatePipe ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailVerifyComponent);
    component = fixture.componentInstance;

    // mock cooldown timer
    component.cooldownTimer = { duration: 0, startTimer: jasmine.createSpy('startTimer') } as never;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should verify email successfully', fakeAsync(() => {
    verifyService.verifyEmail.and.returnValue(of({ status: 'success' }));

    component.verifyEmail('token-123');
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('EMAIL_VERIFY.SUCCESS');
  }));

  it('should handle expired token', fakeAsync(() => {
    verifyService.verifyEmail.and.returnValue(of({ status: 'expired' }));

    component.verifyEmail('token-123');
    tick();

    expect(component.loading).toBeFalse();
    expect(component.canResend).toBeTrue();
    expect(component.message).toBe('EMAIL_VERIFY.EXPIRED');
  }));

  it('should handle invalid token', fakeAsync(() => {
    verifyService.verifyEmail.and.returnValue(of({ status: 'invalid' }));

    component.verifyEmail('token-123');
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('EMAIL_VERIFY.INVALID');
  }));

  it('should handle network error', fakeAsync(() => {
    verifyService.verifyEmail.and.returnValue(throwError(() => new Error('Network')));

    component.verifyEmail('token-123');
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('EMAIL_VERIFY.NETWORK_ERROR');
  }));

  it('should resend email successfully and start cooldown', fakeAsync(() => {
    verifyService.resendEmail.and.returnValue(of({}));

    component.email = 'test@example.com';
    component.onResend();
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('EMAIL_VERIFY.RESEND_SUCCESS');
    expect(component.cooldownTimer.startTimer).toHaveBeenCalled();
  }));

  it('should handle resend email error', fakeAsync(() => {
    verifyService.resendEmail.and.returnValue(throwError(() => new Error('Fail')));

    component.email = 'test@example.com';
    component.onResend();
    tick();

    expect(component.loading).toBeFalse();
    expect(component.canResend).toBeTrue();
    expect(component.message).toBe('EMAIL_VERIFY.RESEND_ERROR');
  }));






});
