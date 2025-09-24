// validators/availability.validator.ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { RegisterService } from '../services/register.service';
import { debounceTime, distinctUntilChanged, first, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export function availabilityValidator(
  registerService: RegisterService,
  field: 'email' | 'phone'
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return of(null); // si vide, pas d'erreur

    return of(control.value).pipe(
      debounceTime(400),
      distinctUntilChanged(), //Ne pas refaire la validation pour une valeur identique
      switchMap(value => //Annuler les requêtes obsolètes et ne garder que la dernière
        registerService.checkAvailability(field, value).pipe(
          map((isAvailable: boolean) => (isAvailable ? null : { notAvailable: true })),
        )
      ),
      first() //Compléter l’Observable pour qu’Angular puisse terminer l’AsyncValidator
    );
  };
}
