import { VerifyService } from './../../services/verify.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { RegisterResponse, RegisterService } from '../../services/register.service';
import { confirmEqualValidator } from '../../validators/confirm-equal.validator';
import { passwordStrengthValidator } from '../../validators/password-strength.validator';
import { phoneValidator } from '../../validators/phone.validator';
import { availabilityValidator } from '../../validators/availability.validator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-register-form-component',
  templateUrl: './register-form-component.html',
  styleUrls: ['./register-form-component.scss']
})
export class RegisterFormComponent implements OnInit {
  mainForm!: FormGroup;
  loading = false;

  emailExists = false;
  phoneExists = false;
  existingPhone: string = '';
  existingEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private verifyService: VerifyService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.mainForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      contact_preference: ['email'],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', [phoneValidator]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirm_password: ['', Validators.required],
      consent: [false, Validators.requiredTrue]
    }, {
      validators: [confirmEqualValidator('password', 'confirm_password')]
    });

    const emailCtrl = this.mainForm.get('email')!;
    const phoneCtrl = this.mainForm.get('phone')!;

    const pref = this.mainForm.get('contact_preference')!.value;
    if (pref === 'email') {
      emailCtrl.enable({ emitEvent: false });
      emailCtrl.setAsyncValidators([availabilityValidator(this.registerService, 'email')]);
      emailCtrl.updateValueAndValidity({ emitEvent: false });

      phoneCtrl.disable({ emitEvent: false });
      phoneCtrl.clearAsyncValidators();
      phoneCtrl.updateValueAndValidity({ emitEvent: false });
    } else {
      phoneCtrl.enable({ emitEvent: false });
      phoneCtrl.setAsyncValidators([availabilityValidator(this.registerService, 'phone')]);
      phoneCtrl.updateValueAndValidity({ emitEvent: false });

      emailCtrl.disable({ emitEvent: false });
      emailCtrl.clearAsyncValidators();
      emailCtrl.updateValueAndValidity({ emitEvent: false });
    }

  // --- Changement de préférence ---
  this.mainForm.get('contact_preference')?.valueChanges.subscribe(pref => {
    if (pref === 'email') {
      emailCtrl.enable({ emitEvent: false });
      emailCtrl.setValidators([Validators.required, Validators.email]);
      emailCtrl.setAsyncValidators([availabilityValidator(this.registerService, 'email')]);

      phoneCtrl.disable({ emitEvent: false });
      phoneCtrl.clearValidators();
      phoneCtrl.clearAsyncValidators();
      phoneCtrl.setValue('');
    } else {
      phoneCtrl.enable({ emitEvent: false });
      phoneCtrl.setValidators([Validators.required, phoneValidator]);
      phoneCtrl.setAsyncValidators([availabilityValidator(this.registerService, 'phone')]);

      emailCtrl.disable({ emitEvent: false });
      emailCtrl.clearValidators();
      emailCtrl.clearAsyncValidators();
      emailCtrl.setValue('');
    }

    emailCtrl.updateValueAndValidity({ emitEvent: false });
    phoneCtrl.updateValueAndValidity({ emitEvent: false });
  });

  // --- Suivi status async ---
  emailCtrl.statusChanges.subscribe(status => {
    if (status === 'VALID' && emailCtrl.dirty) this.emailExists = false;
    if (status === 'INVALID' && emailCtrl.hasError('notAvailable')) {
      this.emailExists = true;
      this.existingEmail = emailCtrl.value;
    }
  });

  phoneCtrl.statusChanges.subscribe(status => {
    if (status === 'VALID' && phoneCtrl.dirty) this.phoneExists = false;
    if (status === 'INVALID' && phoneCtrl.hasError('notAvailable')) {
      this.phoneExists = true;
      this.existingPhone = phoneCtrl.value;
    }
  });
  }


  getFormControlErrorText(ctrl: AbstractControl): string {
    if (ctrl.hasError('required')) return this.translate.instant('FORM.ERRORS.REQUIRED');
    if (ctrl.hasError('email')) return this.translate.instant('FORM.ERRORS.INVALID_EMAIL');
    if (ctrl.hasError('invalidPhone')) return this.translate.instant('FORM.ERRORS.INVALID_PHONE');
    return this.translate.instant('FORM.ERRORS.REQUIRED');
  }

  errorMessages(errors: Record<string, string> | null | undefined): string[] {
    if (!errors) return [];
    return Object.values(errors as Record<string, string>).map(msg => this.translate.instant(msg));
  }

onSubmitForm() {
  if (this.mainForm.invalid) return;

  this.loading = true;

  this.registerService.register(this.mainForm.value).subscribe({
    next: (res: RegisterResponse) => {
      this.loading = false;

      if (res.success) {
        const contactPref = this.mainForm.get('contact_preference')?.value;

        if (contactPref === 'email') {
          this.snackBar.open(
            this.translate.instant('REGISTER.SUCCESS_EMAIL'),
            this.translate.instant('REGISTER.CLOSE'),
            { duration: 4000, horizontalPosition: 'right', verticalPosition: 'top' }
          );

          const email = this.mainForm.get('email')?.value;

          this.verifyService.sendVerificationEmail(email).subscribe({
            next: () => {
              console.log('Email de vérification envoyé', email);
              this.router.navigate(['/auth/email'], {
                queryParams: { email }
              });
            },
            error: (err) => console.error(this.translate.instant('REGISTER.EMAIL_SEND_ERROR'), err)
          });

        } else if (contactPref === 'phone') {
          this.snackBar.open(
            this.translate.instant('REGISTER.SUCCESS_PHONE'),
            this.translate.instant('REGISTER.CLOSE'),
            { duration: 4000, horizontalPosition: 'right', verticalPosition: 'top' }
          );

          const phone = this.mainForm.get('phone')?.value;

          this.router.navigate(['/auth/otp'], {
            queryParams: { phone }
          });
        }
      }
    },
    error: (err) => {
      this.loading = false;
      if (err.status === 409) {
        if (this.mainForm.get('contact_preference')?.value === 'email') {
          this.emailExists = true;
          this.existingEmail = this.mainForm.get('email')?.value;
        } else {
          this.phoneExists = true;
          this.existingPhone = this.mainForm.get('phone')?.value;
        }
      } else if (err.status === 400) {
        console.error(this.translate.instant('REGISTER.VALIDATION_ERROR'), err.message);
      } else {
        console.error(this.translate.instant('REGISTER.UNKNOWN_ERROR'), err.message);
      }
    }
  });
}



}
