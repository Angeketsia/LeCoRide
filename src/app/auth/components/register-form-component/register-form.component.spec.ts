// Import du pipe factice pour les tests (mock) afin de remplacer le pipe réel TranslatePipe
import { MockTranslatePipe } from './../../pipes/mock-translate.pipe';

// Import du module partagé de l'application (composants, pipes, directives communes)
import { SharedModule } from './../../../shared/shared-module';

// Import des utilitaires de test Angular : TestBed pour créer un environnement de test, ComponentFixture pour manipuler un composant, fakeAsync/tick/flush pour simuler le passage du temps
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';

// Import du module ReactiveForms pour créer et manipuler des formulaires réactifs
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
// Import des fonctions utilitaires de RxJS pour simuler des observables
import { of, throwError } from 'rxjs';

// Import du composant à tester
import { RegisterFormComponent } from './register-form-component';

// Import du service utilisé par le composant pour gérer l'inscription
import { RegisterService } from '../../services/register.service';

// Import des modules de traduction Angular et du service de traduction
import { TranslateModule, TranslateService } from '@ngx-translate/core';


// Début de la suite de tests pour le composant RegisterFormComponent
describe('RegisterFormComponent', () => {

  // Déclaration des variables utilisées dans les tests
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let mockService: jasmine.SpyObj<RegisterService>; // mock du service pour contrôler son comportement
  let translateService: jasmine.SpyObj<TranslateService>; // mock du service de traduction

  // Configuration initiale avant chaque test
  beforeEach(async () => {

    // Création d’un spy pour RegisterService avec les méthodes register et checkAvailability
    mockService = jasmine.createSpyObj('RegisterService', ['register', 'checkAvailability']);

    // Par défaut, checkAvailability renvoie true (email/phone disponible)
    mockService.checkAvailability.and.returnValue(of(true));

    // Création d’un spy pour TranslateService avec la méthode instant()
    translateService = jasmine.createSpyObj('TranslateService', ['instant']);

    // Simulation de instant() : retourne simplement la clé fournie
    translateService.instant.and.callFake((key: string) => key);

    // Configuration du module de test
    await TestBed.configureTestingModule({
      declarations: [RegisterFormComponent], // déclarer le composant à tester
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule, // formulaire réactif
        SharedModule, // module partagé
        MockTranslatePipe, // pipe mock pour traductions
        TranslateModule.forRoot() // module de traduction (nécessaire pour template)
      ],
      providers: [
        { provide: RegisterService, useValue: mockService }, // injecter le mock du service
        { provide: TranslateService, useValue: translateService } // injecter le mock du service de traduction
      ]
    }).compileComponents(); // compile les composants déclarés

    // Création de l'instance du composant pour le test
    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;

    // Détecte les changements initiaux du composant (ngOnInit, binding, etc.)
    fixture.detectChanges();
  });

  /** ---------- TEST CREATION DU COMPOSANT ---------- */
  it('devrait créer le composant', () => {
    // Vérifie que le composant est correctement instancié
    expect(component).toBeTruthy();
  });

  /** ---------- TEST REACTIVE FORMS ---------- */
  describe('Reactive Forms Validators', () => {

    it('formulaire vide doit être invalide', () => {
      // Vérifie qu'un formulaire vide est invalide
      expect(component.mainForm.valid).toBeFalse();
    });

    it('formulaire valide avec email correct et mot de passe fort', () => {
      // Remplissage du formulaire avec des valeurs valides
      component.mainForm.patchValue({
        first_name: 'Jean',
        last_name: 'Dupont',
        contact_preference: 'email',
        email: 'test@example.com',
        password: 'Azerty@123',
        confirm_password: 'Azerty@123',
        consent: true
      });
      // Met à jour les validations après patchValue
      component.mainForm.updateValueAndValidity();

      // Vérifie que le formulaire devient valide
      expect(component.mainForm.valid).toBeTrue();
    });

    it('mot de passe faible déclenche passwordStrength', () => {
      // Met un mot de passe faible
      component.mainForm.get('password')!.setValue('abc');
      const errors = component.mainForm.get('password')!.errors;

      // Vérifie que l'erreur passwordStrength est présente
      expect(errors).toBeTruthy();
      expect(errors!['passwordStrength']).toBeTruthy();
      expect(errors!['passwordStrength']).toBeDefined();
    });

    it('confirm_password différent déclenche confirmEqual', () => {
      // Patch du mot de passe et confirm_password différents
      component.mainForm.patchValue({
        password: 'Azerty@123',
        confirm_password: 'Wrong123'
      });
      component.mainForm.updateValueAndValidity();

      // Vérifie que l'erreur confirmEqual est déclenchée
      const confirmErrors = component.mainForm.get('confirm_password')!.errors;
      expect(confirmErrors).toEqual({ confirmEqual: true });
    });

    it('phoneValidator invalide pour numéro incorrect', () => {
      // Patch avec contact_preference = phone et numéro invalide
      component.mainForm.patchValue({ contact_preference: 'phone', phone: '123' });
      const ctrl = component.mainForm.get('phone')!;
      ctrl.updateValueAndValidity();

      // Vérifie l'erreur de validation pour téléphone
      expect(ctrl.errors).toEqual({ invalidPhone: true });
    });

    it('validValidator déclenche erreur si le champ n\'a pas "VALID"', () => {
      // Met une valeur arbitraire
      const ctrl = component.mainForm.get('first_name')!;
      ctrl.setValue('hello');

      // Applique manuellement le validValidator pour le test
      ctrl.setValidators([() => ({ validValidator: true })]);
      ctrl.updateValueAndValidity();

      // Vérifie que l'erreur validValidator est présente
      expect(ctrl.errors).toEqual({ validValidator: true });
    });
  });

  /** ---------- TEST ASYNC VALIDATORS ---------- */
  describe('Async Validators', () => {

    it('email déjà utilisé déclenche notAvailable', fakeAsync(() => {
      // Simule un email déjà utilisé
      mockService.checkAvailability.and.returnValue(of(false));
      component.mainForm.get('contact_preference')!.setValue('email');

      const emailCtrl = component.mainForm.get('email')!;
      emailCtrl.setValue('already@used.com');
      emailCtrl.markAsDirty();

      // Simule le délai de debounceTime de l’async validator
      tick(500);

      // Vérifie que l’erreur notAvailable est présente
      expect(emailCtrl.errors).toEqual({ notAvailable: true });
      flush();
    }));

    it('phone déjà utilisé déclenche notAvailable', fakeAsync(() => {
      // Simule un phone déjà utilisé
      mockService.checkAvailability.and.returnValue(of(false));
      component.mainForm.get('contact_preference')!.setValue('phone');

      const phoneCtrl = component.mainForm.get('phone')!;
      phoneCtrl.setValue('0123456789');
      phoneCtrl.markAsDirty();

      tick(500);
      expect(phoneCtrl.errors).toEqual({ notAvailable: true });
      flush();
    }));
  });

  /** ---------- TEST ONSUBMITFORM ---------- */
  describe('onSubmitForm', () => {

    it('appelle register et gère succès 200', fakeAsync(() => {
      // Simule la réponse de succès du service register
      mockService.register.and.returnValue(of({ success: true, status: 200 }));

      // Remplissage du formulaire
      component.mainForm.patchValue({
        first_name: 'Jean',
        last_name: 'Dupont',
        contact_preference: 'email',
        email: 'test@example.com',
        password: 'Azerty@123',
        confirm_password: 'Azerty@123',
        consent: true
      });

      // Appel de la méthode submit
      component.onSubmitForm();

      tick(); // simule le passage du temps pour l'observable
      // Vérifie que le service register a été appelé
      expect(mockService.register).toHaveBeenCalled();
      // Vérifie que loading est remis à false
      expect(component.loading).toBeFalse();
    }));

    it('gère conflit 409', fakeAsync(() => {
      // Simule un conflit email déjà utilisé
      mockService.register.and.returnValue(throwError({ status: 409 }));

      component.mainForm.patchValue({
        first_name: 'Jean',
        last_name: 'Dupont',
        contact_preference: 'email',
        email: 'already@used.com',
        password: 'Azerty@123',
        confirm_password: 'Azerty@123',
        consent: true
      });

      component.onSubmitForm();
      tick(); // exécution du subscribe

      // Vérifie que le flag emailExists est activé et l’email existant est stocké
      expect(component.emailExists).toBeTrue();
      expect(component.existingEmail).toBe('already@used.com');
    }));

    it('gère erreur 400', () => {
      // Simule une erreur de validation 400
      mockService.register.and.returnValue(throwError({ status: 400 }));

      component.mainForm.patchValue({
        first_name: 'Jean',
        last_name: 'Dupont',
        contact_preference: 'email',
        email: 'invalid@example.com',
        password: 'Azerty@123',
        confirm_password: 'Azerty@123',
        consent: true
      });

      component.onSubmitForm();
      // Vérifie que loading est remis à false même en cas d'erreur
      expect(component.loading).toBeFalse();
    });
  });

  /** ---------- TEST i18n ---------- */
  it('getFormControlErrorText utilise TranslateService', () => {
    const ctrl = component.mainForm.get('email')!;
    ctrl.setErrors({ required: true });

    // Appel de la fonction qui utilise TranslateService pour récupérer le texte
    const text = component.getFormControlErrorText(ctrl);

    // Vérifie que translateService.instant a été appelé avec la clé correcte
    expect(translateService.instant).toHaveBeenCalledWith('FORM.ERRORS.REQUIRED');
    // Vérifie que la fonction retourne bien la clé (mock)
    expect(text).toBe('FORM.ERRORS.REQUIRED');
  });

});
