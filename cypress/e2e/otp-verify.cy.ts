/// <reference types="cypress" />

describe('OTP Verification Flow', () => {
  const phone = '699112233';
  const correctCode = '123456';
  const wrongCode = '000000';

  beforeEach(() => {
    cy.visit(`/auth/otp?phone=${phone}`);
  });

  it('devrait envoyer le code OTP et afficher le message d\'attente', () => {
    cy.intercept('POST', '**/verify/sendOtp').as('sendOtp');

    cy.get('[data-cy=get-code-btn]').click();

    cy.wait('@sendOtp');

    cy.get('[data-cy=otp-message]').should('contain.text', 'Entrez le code reçu.');
    cy.get('[data-cy=otp-input]').should('exist');
    cy.get('[data-cy=otp-timer]').should('exist');
  });

  it('devrait renvoyer le code OTP après timer', () => {
    cy.intercept('POST', '**/verify/sendOtp').as('resendOtp');

    cy.get('[data-cy=get-code-btn]').click();
    cy.wait('@resendOtp');

    // simuler la fin du timer
    cy.get('app-countdown-timer').then($timer => {
      // appeler la méthode "finished" du composant Angular
      const cmp = $timer[0]['__ngContext__'][8] as any;
      cmp.finished.emit();
    });

    cy.get('[data-cy=resend-otp-btn]').should('not.be.disabled').click();
    cy.wait('@resendOtp');
    cy.get('[data-cy=otp-message]').should('contain.text', 'Entrez le code reçu.');
  });

  it('devrait bloquer après 3 tentatives échouées', () => {
    cy.intercept('POST', '**/verify/otp', { statusCode: 200, body: { status: 'fail' } }).as('verifyOtp');
    cy.intercept('POST', '**/verify/sendOtp').as('sendOtp');

    cy.get('[data-cy=get-code-btn]').click();
    cy.wait('@sendOtp');

    for (let i = 0; i < 3; i++) {
      cy.get('[data-cy=otp-input] input').each(($input, index) => {
        cy.wrap($input).clear().type(wrongCode[index]);
      });

      cy.wait('@verifyOtp');

      if (i < 2) {
        cy.get('[data-cy=otp-message]').should('contain.text', `Tentatives restantes : ${2 - i}`);
      } else {
        cy.get('[data-cy=otp-message]').should('contain.text', 'Trop de tentatives. Réessayez dans 15 minutes.');
        cy.get('[data-cy=resend-otp-btn]').should('be.disabled');
      }
    }
  });

  it('devrait accepter le code correct et rediriger vers le dashboard', () => {
  cy.intercept('POST', '**/verify/sendOtp').as('sendOtp');
  cy.intercept('POST', '**/verify/otp').as('verifyOtp');

  cy.get('[data-cy=get-code-btn]').click();
  cy.wait('@sendOtp');

  cy.get('[data-cy=otp-input] input').each(($input, index) => {
    cy.wrap($input).clear().type(correctCode[index]);
  });

  cy.wait('@verifyOtp');

  // attendre un petit peu que le router fasse sa navigation
  cy.wait(200);

  // Vérifier la redirection
  cy.url({ timeout: 10000 }).should('include', '/dashboard');

  // Vérifier le message s'il est affiché
  cy.get('[data-cy=otp-message]').should('contain.text', 'Code correct. Redirection ...');
});


  it('devrait gérer l\'erreur réseau lors de la vérification', () => {
    cy.intercept('POST', '**/verify/otp', { forceNetworkError: true }).as('verifyOtp');
    cy.intercept('POST', '**/verify/sendOtp').as('sendOtp');

    cy.get('[data-cy=get-code-btn]').click();
    cy.wait('@sendOtp');

    cy.get('[data-cy=otp-input] input').each(($input, index) => {
      cy.wrap($input).clear().type(correctCode[index]);
    });

    cy.wait('@verifyOtp');

    cy.get('[data-cy=otp-message]').should('contain.text', 'Erreur réseau');
  });
});
