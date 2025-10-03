import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VerifyService } from '../../../services/verify.service';
import { CountdownTimerComponent } from '../../../../shared/components/countdown-timer-component/countdown-timer-component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-email-verify-component',
  standalone: false,
  templateUrl: './email-verify-component.html',
  styleUrl: './email-verify-component.scss'
})
export class EmailVerifyComponent implements OnInit {

  message = '';
  canResend = false;
  loading = false;
  email!: string;

  @ViewChild('cooldownTimer') cooldownTimer!: CountdownTimerComponent;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private verifyService: VerifyService,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.verifyEmail(token);
    }
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
    });
  }

  verifyEmail(token: string) {
    this.message = this.translate.instant('EMAIL_VERIFY.VERIFYING'); // "Vérification en cours..."
    this.loading = true;
    this.track('verifyStarted');

    this.verifyService.verifyEmail(token).subscribe({
      next: (res: { status: 'success' | 'expired' | 'invalid'; message?: string }) => {
        this.loading = false;
        if (res.status === 'success') {
          this.message = this.translate.instant('EMAIL_VERIFY.SUCCESS');
          // "Email vérifié avec succès. Vous pouvez maintenant vous connecter."
          this.track('verifySucceeded');
        } else if (res.status === 'expired') {
          this.message = this.translate.instant('EMAIL_VERIFY.EXPIRED');
          // "Lien expiré. Cliquez ci-dessous pour renvoyer."
          this.canResend = true;
          this.track('verifyFailed', { reason: 'expired' });
        } else {
          this.message = this.translate.instant('EMAIL_VERIFY.INVALID');
          this.track('verifyFailed', { reason: 'invalid' });
        }
      },
      error: () => {
        this.loading = false;
        this.message = this.translate.instant('EMAIL_VERIFY.NETWORK_ERROR');
        this.track('verifyFailed', { reason: 'network' });
      }
    });
  }

  onResend() {
    this.canResend = false;
    this.loading = true;
    this.message = this.translate.instant('EMAIL_VERIFY.RESENDING'); // "Renvoi en cours..."

    this.verifyService.resendEmail(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.message = this.translate.instant('EMAIL_VERIFY.RESEND_SUCCESS');
        // "Email renvoyé ! Vérifiez votre boîte de réception."
        this.cooldownTimer.duration = 60;
        this.cooldownTimer.startTimer();
      },
      error: () => {
        this.loading = false;
        this.canResend = true;
        this.message = this.translate.instant('EMAIL_VERIFY.RESEND_ERROR');
        // "Erreur lors du renvoi. Veuillez réessayer."
      }
    });
  }

  onCooldownFinished() {
    this.canResend = true;
    this.message = this.translate.instant('EMAIL_VERIFY.CAN_RESEND');
    // "Vous pouvez renvoyer un nouvel email."
  }

  track(event: string, data: unknown = {}) {
    console.log('[Tracking]', event, data);
  }
}
