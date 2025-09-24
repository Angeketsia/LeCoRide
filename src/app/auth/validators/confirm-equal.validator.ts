// validators/confirm-equal.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function confirmEqualValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors['confirmEqual']) {
      return null; // ne pas écraser d'autres erreurs
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ confirmEqual: true });
    } else {
      matchingControl.setErrors(null);
    }

    return null;
  };
}
