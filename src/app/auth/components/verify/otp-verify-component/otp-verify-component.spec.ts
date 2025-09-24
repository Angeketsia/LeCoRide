import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OtpVerifyComponent } from './otp-verify-component';
import { VerifyService } from './../../../services/verify.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from './../../../../shared/shared-module';
import { MockTranslatePipe } from './../../../pipes/mock-translate.pipe';

describe('OtpVerifyComponent', () => {
  let component: OtpVerifyComponent;
  let fixture: ComponentFixture<OtpVerifyComponent>;
  let verifyService: jasmine.SpyObj<VerifyService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    verifyService = jasmine.createSpyObj('VerifyService', ['sendOtp', 'verifyOtp']);
    translateService = jasmine.createSpyObj('TranslateService', ['instant']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    translateService.instant.and.callFake((key: string, params?: any) => key + (params?.remaining ?? ''));

    await TestBed.configureTestingModule({
      declarations: [OtpVerifyComponent],
      providers: [
        { provide: VerifyService, useValue: verifyService },
        { provide: TranslateService, useValue: translateService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
         useValue: {
          queryParams: of({ phone: '698585456' }),
          snapshot: { queryParams: { phone: '698585456' } }
        }
        }
      ],
      imports: [SharedModule, MockTranslatePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(OtpVerifyComponent);
    component = fixture.componentInstance;

   // mock ViewChilds
      component.timer = { startTimer: jasmine.createSpy('startTimer'),  stopTimer: jasmine.createSpy('stopTimer') } as any;
      Object.defineProperty(component.timer, 'duration', { writable: true, value: 0 });

      component.otpInput = { onClear: jasmine.createSpy('onClear') } as any;
      Object.defineProperty(component.otpInput, 'error', { writable: true, value: false });


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.phone).toBe('698585456');
  });

  it('should send OTP successfully', fakeAsync(() => {
    verifyService.sendOtp.and.returnValue(of({}));

    component.onGetCode();
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('OTP.ENTER_CODE');
    expect(component.timer.startTimer).toHaveBeenCalled();
  }));

  it('should handle send OTP error', fakeAsync(() => {
    verifyService.sendOtp.and.returnValue(throwError(() => new Error('fail')));

    component.onGetCode();
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('OTP.SEND_ERROR');
  }));

  it('should verify OTP successfully', fakeAsync(() => {
    verifyService.verifyOtp.and.returnValue(of({ status: 'success' }));

    component.onOtpCompleted('123456');
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('OTP.CORRECT');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  }));

  it('should increment attempts on wrong OTP', fakeAsync(() => {
    verifyService.verifyOtp.and.returnValue(of({ status: 'fail' }));

    component.onOtpCompleted('000000');
    tick(1000);

    expect(component.loading).toBeFalse();
    expect(component.attempts).toBe(1);
    expect(component.message).toContain('OTP.INCORRECT_ATTEMPTS');
    expect(component.otpInput.error).toBeFalse(); // après setTimeout
  }));

  it('should block after max attempts', fakeAsync(() => {
    verifyService.verifyOtp.and.returnValue(of({ status: 'fail' }));
    component.attempts = 2; // maxAttempts = 3

    component.onOtpCompleted('000000');
    tick();

    expect(component.isBlocked).toBeTrue();
    expect(component.timer.duration).toBe(15 * 60);
    expect(component.message).toBe('OTP.BLOCKED');
  }));

  it('should handle network error during OTP verification', fakeAsync(() => {
    verifyService.verifyOtp.and.returnValue(throwError(() => new Error('network')));

    component.onOtpCompleted('123456');
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('EMAIL_VERIFY.NETWORK_ERROR');
  }));

  it('should allow resend OTP and start cooldown', fakeAsync(() => {
    verifyService.sendOtp.and.returnValue(of({}));

    component.onResendOtp();
    tick();

    expect(component.loading).toBeFalse();
    expect(component.message).toBe('OTP.ENTER_CODE');
    expect(component.timer.startTimer).toHaveBeenCalled();
  }));

  it('should handle max resend attempts', () => {
    component.attempsResend = 2; // maxAttempsResend = 2
    component.onTimerFinished();

    expect(component.canResend).toBeFalse();
    expect(component.message).toBe('OTP.MAX_RESEND');
    expect(component.timer.startTimer).toHaveBeenCalled();
  });

  it('should unblock after timer finishes', () => {
    component.isBlocked = true;
    component.onTimerFinished();

    expect(component.isBlocked).toBeFalse();
    expect(component.attempts).toBe(0);
    expect(component.message).toBe('OTP.CAN_RETRY');
  });
});
