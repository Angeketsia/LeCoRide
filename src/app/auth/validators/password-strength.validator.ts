// validators/password-strength.validator.ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';

  if (!value) return null;

  const errors: any = {};

  if (value.length < 8) {
    errors.minLength = 'FORM.ERRORS.PASSWORD_MIN_LENGTH';
  }
  if (!/[A-Z]/.test(value)) {
    errors.upperCase = 'FORM.ERRORS.PASSWORD_UPPER';
  }
  if (!/[a-z]/.test(value)) {
    errors.lowerCase = 'FORM.ERRORS.PASSWORD_LOWER';
  }
  if (!/\d/.test(value)) {
    errors.number = 'FORM.ERRORS.PASSWORD_NUMBER';
  }
  if (!/[@$!%*?&#]/.test(value)) {
    errors.specialChar = 'FORM.ERRORS.PASSWORD_SPECIAL';
  }

  return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
}
