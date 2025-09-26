/// <reference types="cypress" />

describe('OTP Verification Flow', () => {
  const phone = '699112233';
  const correctCode = '123456';
  const wrongCode = '000000';

  beforeEach(() => {
    cy.visit(`/auth/otp?phone=${phone}`);
  });

  it('devrait envoyer le code OTP et afficher le message d\'attente', () => {
    cy.intercept('POST', '**/verify/sendOtp', {
      statusCode: 200,
      body: { status: 'success', message: 'Entrez le code reçu.' }
    }).as('sendOtp');

    cy.get('[data-cy=get-code-btn]').click();

    cy.wait('@sendOtp');

    cy.get('[data-cy=otp-message]').should('contain.text', 'Entrez le code reçu.');
    cy.get('[data-cy=otp-input]').should('exist');
    cy.get('[data-cy=otp-timer]').should('exist');
  });



  it('devrait bloquer après 3 tentatives échouées', () => {
    let attemptCount = 0;

  cy.intercept('POST', '**/verify/otp', (req) => {
    attemptCount++;
    if (attemptCount < 3) {
      req.reply({ statusCode: 200, body: { status: 'fail', remaining: 3 - attemptCount } });
    } else {
      req.reply({ statusCode: 200, body: { status: 'fail', message: 'Trop de tentatives. Réessayez dans 15 minutes.' } });
    }
  }).as('verifyOtp');

    cy.intercept('POST', '**/verify/sendOtp').as('sendOtp');

    cy.get('[data-cy=get-code-btn]').click();
    cy.wait('@sendOtp');

    for (let i = 0; i < 3; i++) {
      cy.get('[data-cy=otp-input] input').first().clear().type(wrongCode);
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
  cy.intercept('POST', '**/verify/otp', (req) => {
  if (req.body.code === correctCode) {
    req.reply({ statusCode: 200, body: { status: 'success', message: 'Code correct. Redirection ...' } });
  } else {
    req.reply({ statusCode: 200, body: { status: 'fail', message: 'Code incorrect' } });
  }
  }).as('verifyOtp');

  cy.get('[data-cy=get-code-btn]').click();
  cy.wait('@sendOtp');

  cy.get('[data-cy=otp-input] input').each(($input, index) => {
    cy.wrap($input).clear().type(correctCode[index]);
  });

  cy.wait('@verifyOtp');

  // cy.get('[data-cy=otp-message]').should('be.visible');
  // cy.get('[data-cy=otp-message]').should('contain.text', 'Code correct. Redirection ...');
  cy.wait(200);
  cy.url({ timeout: 10000 }).should('include', '/auth/dashboard');
});


});
