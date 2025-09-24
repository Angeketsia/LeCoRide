import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // ✅ Sécurité : si le champ est vide => pas d’erreur
    if (!value) {
      return null;
    }

    // Exemple : on exige que le mot "VALID" apparaisse dans la valeur
    if (typeof value === 'string' && !value.includes('VALID')) {
      return { validValidator: true };
    }

    return null;
  };
}
