import { AbstractControl, ValidationErrors } from '@angular/forms';

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const valid = /^(\+?\d{1,3})?\d{8,12}$/.test(value);
  return valid ? null : { invalidPhone: true };
}

/* ^ : début de la chaîne.

(\+?\d{1,3})?

\+? → accepte éventuellement un + au début (ex: +33, +237).

\d{1,3} → ensuite 1 à 3 chiffres (code pays, ex: 33, 237).

(...) ? → ce bloc est optionnel (tu peux mettre un numéro avec ou sans indicatif).

✅ Exemple accepté : +33, 237, ou rien du tout.

\d{8,12}

Après l’indicatif optionnel, il doit y avoir 8 à 12 chiffres.

Ça correspond au numéro national (par exemple un numéro de mobile).

$ : fin de la chaîne.
*/
