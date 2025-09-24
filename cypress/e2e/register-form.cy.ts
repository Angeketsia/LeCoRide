/// <reference types="cypress" />

describe('Register Form E2E', () => {
  beforeEach(() => {
    cy.visit('/auth/register'); // page où est le RegisterFormComponent
  });

  it('affiche le formulaire et les validations', () => {
    // Champs vides → bouton submit désactivé
    cy.get('[data-cy="register-submit"]').should('be.disabled');

    // Remplir nom/prénom
    cy.get('[data-cy="register-firstname"]').type('Marie');
    cy.get('[data-cy="register-lastname"]').type('Ange');

    // Choisir email comme contact
    cy.get('[data-cy="pref-email"]').click();

    // Email invalide
    cy.get('[data-cy="register-email"]').type('emailInvalid').blur();
    cy.get('[data-cy="register-submit"]').should('be.disabled');
    cy.get('mat-error').should('contain.text', 'FORM.ERRORS.INVALID_EMAIL');

    // Email valide
    cy.get('[data-cy="register-email"]').clear().type('marieange@gmail.com');

    // Mot de passe faible
    cy.get('[data-cy="register-password"]').type('abc');
    cy.get('mat-error').should('contain.text', 'FORM.ERRORS.REQUIRED');

    // Mot de passe fort
    cy.get('[data-cy="register-password"]').clear().type('Azerty@123');
    cy.get('[data-cy="register-confirm-password"]').type('Azerty@123');

    // Consentement requis
    cy.get('[data-cy="register-submit"]').should('be.disabled');
    cy.get('[data-cy="register-consent"]').click();

    // Bouton activé
    cy.get('[data-cy="register-submit"]').should('not.be.disabled');
  });

  it('email déjà utilisé (async validator)', () => {
    cy.intercept('GET', '**/check-email**', { body: { available: false } });

    cy.get('[data-cy="pref-email"]').click();
    cy.get('[data-cy="register-email"]').type('already@used.com');

    cy.wait(500);

    // cy.get('mat-error').should('contain.text', 'FORM.LINK.LOGIN_EMAIL');
  });

  it('téléphone déjà utilisé (async validator)', () => {
    cy.intercept('GET', '**/check-phone**', { body: { available: false } });

    cy.get('[data-cy="pref-phone"]').click();
    cy.get('[data-cy="register-phone"]').type('690000000');

    cy.wait(500);

    // cy.get('mat-error').should('contain.text', 'FORM.LINK.LOGIN_PHONE');
  });

  it('soumission succès par email', () => {
    cy.intercept('POST', '**/auth-register', {
      statusCode: 200,
      body: { success: true, status: 200 },
    }).as('register');

    cy.get('[data-cy="register-firstname"]').type('Ketsia');
    cy.get('[data-cy="register-lastname"]').type('Ange');
    cy.get('[data-cy="pref-email"]').click();
    cy.get('[data-cy="register-email"]').type('ketsia@gmail.com');
    cy.get('[data-cy="register-password"]').type('Azerty@123');
    cy.get('[data-cy="register-confirm-password"]').type('Azerty@123');
    cy.get('[data-cy="register-consent"]').click();

    cy.get('[data-cy="register-submit"]').click();
    cy.wait('@register');

    // Snackbar
    cy.get('simple-snack-bar').should('contain.text', 'Inscription réussie');

    // Redirection vers email-verify
    // cy.url().should('include', '/email-verify');
    // cy.get('[data-cy=email-code]').should('exist');
  });

  it('soumission succès par téléphone', () => {
    cy.intercept('POST', '**/auth-register', {
      statusCode: 200,
      body: { success: true, status: 200 },
    }).as('register');

    cy.get('[data-cy="register-firstname"]').type('Jane');
    cy.get('[data-cy="register-lastname"]').type('Doe');
    cy.get('[data-cy="pref-phone"]').click();
    cy.get('[data-cy="register-phone"]').type('699112233');
    cy.get('[data-cy="register-password"]').type('StrongPass123!');
    cy.get('[data-cy="register-confirm-password"]').type('StrongPass123!');
    cy.get('[data-cy="register-consent"]').click();

    cy.get('[data-cy="register-submit"]').click();
    cy.wait('@register');

    // Snackbar
    cy.get('simple-snack-bar').should('contain.text', 'Inscription réussie');

    // Redirection vers OTP
    cy.url().should('include', '/auth/otp');

    cy.url().should('include', '/auth/otp');
    // cy.get('[data-cy=otp-digit-0]', { timeout: 10000 }).should('exist');

  });
});
