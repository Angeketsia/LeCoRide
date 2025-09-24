import { VerifyService } from './../../../services/verify.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CountdownTimerComponentTs } from '../../../../shared/components/countdown-timer-component/countdown-timer-component';
import { OtpInputComponentTs } from '../../../../shared/components/otp-input-component/otp-input-component';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-otp-verify',
  templateUrl: './otp-verify-component.html',
  styleUrls: ['./otp-verify-component.scss']
})
export class OtpVerifyComponent implements OnInit {
  maxAttempts = 3;
  attempts = 0;
  attempsResend = 0;
  maxAttempsResend = 2;
  isBlocked = false;
  message = '';
  canResend = false;
  loading = false;
  codeRequested = false;
  phone!: string;

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private verifyService: VerifyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.phone = params['phone'];
    });
  }

  @ViewChild(CountdownTimerComponentTs) timer!: CountdownTimerComponentTs;
  @ViewChild(OtpInputComponentTs) otpInput!: OtpInputComponentTs;

  // === Quand on clique sur "Obtenir code" ===
  onGetCode() {
    this.loading = true;
    this.canResend = false;
    this.codeRequested = true;
    this.message = this.translate.instant('OTP.SEND_CODE'); // "Envoi du code en cours..."

    this.verifyService.sendOtp(this.phone).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = this.translate.instant('OTP.ENTER_CODE'); // "Entrez le code reçu."
        this.timer.duration = 60;
        this.timer.startTimer();

        this.timer.finished.subscribe(() => {
          this.canResend = true;
          console.log('Timer terminé, bouton de renvoi activé');
        });
      },
      error: (err) => {
        this.loading = false;
        this.timer.duration = 10;
        this.timer.startTimer();
        this.message = this.translate.instant('OTP.SEND_ERROR'); // "Erreur lors de l’envoi du code. Veuillez réessayer."
        console.error(err);
      }
    });
  }
  onResendCode() {
    this.loading = true;
    this.canResend = false;
    this.codeRequested = true;
    this.message = this.translate.instant('OTP.RESEND_CODE'); // "Envoi du code en cours..."

    this.verifyService.sendOtp(this.phone).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = this.translate.instant('OTP.ENTER_CODE'); // "Entrez le code reçu."
        this.timer.duration = 60;
        this.timer.startTimer();
      },
      error: (err) => {
        this.loading = false;
        this.message = this.translate.instant('OTP.SEND_ERROR'); // "Erreur lors de l’envoi du code. Veuillez réessayer."
        console.error(err);
      }
    });
  }

  onOtpCompleted(code: string) {
    if (this.isBlocked) return;

    this.loading = true;
    this.message = this.translate.instant('OTP.VERIFYING'); // "Vérification en cours..."
    this.track('verifyStarted');

    this.verifyService.verifyOtp(this.phone, code).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res.status === 'success') {
          this.message = this.translate.instant('OTP.CORRECT'); // "Code correct. Redirection ..."
          this.track('verifySucceeded');

          if (this.timer) {
            this.timer.stopTimer();
          }
          this.codeRequested = false;

          this.router.navigateByUrl('/dashboard');
        } else {
          // échec côté backend
          this.attempts++;
          if (this.attempts >= this.maxAttempts) {
            this.isBlocked = true;
            this.message = this.translate.instant('OTP.BLOCKED'); // "Trop de tentatives. Réessayez dans 15 minutes."
            this.timer.duration = 15 * 60;
            this.timer.startTimer();
          } else {
            this.message = this.translate.instant('OTP.INCORRECT_ATTEMPTS', { remaining: this.maxAttempts - this.attempts });
            this.otpInput.error = true;

            setTimeout(() => {
              this.otpInput.onClear();
              this.otpInput.error = false;
            }, 600);
          }
          this.track('verifyFailed', { reason: 'invalid_code' });
        }
      },
      error: (err) => {
        this.loading = false;
        this.message = this.translate.instant('EMAIL_VERIFY.NETWORK_ERROR'); // "Erreur réseau"
        this.track('verifyFailed', { reason: 'network' });
        console.error(err);
      }
    });
  }


  // === Quand le timer se termine ===
  onTimerFinished() {
    if (this.isBlocked) {
      this.isBlocked = false;
      this.attempts = 0;
      this.message = this.translate.instant('OTP.CAN_RETRY'); // "Vous pouvez réessayer maintenant."
    } else {
      this.attempsResend++;
      if (this.attempsResend >= this.maxAttempsResend) {
        this.loading = false;
        this.canResend = false;
        this.message = this.translate.instant('OTP.MAX_RESEND'); // "Vous avez atteint le maximum de renvoi. Patientez 15 minutes"
        this.timer.duration = 15 * 60;
        this.timer.startTimer();
      } else {
        this.loading = false;
        this.canResend = true;
        this.message = this.translate.instant('OTP.RESEND_PROMPT');
        // "Vous n'avez pas reçu de code ? cliquez sur 'Renvoyer le code'."
      }
    }
  }

  onResendOtp() {
    this.onResendCode();
  }

  track(event: string, data: any = {}) {
    console.log('[Tracking]', event, data);
  }
}
