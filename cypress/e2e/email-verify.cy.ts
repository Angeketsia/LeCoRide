/// <reference types="cypress" />

describe('Email Verification Flow', () => {
  const email = 'ketsiaAnge@gmail.com';
  const tokenSuccess = 'token-valid';
  const tokenExpired = 'token-expired';
  const tokenInvalid = 'token-invalid';

  it('devrait vérifier l\'email avec succès', () => {
    cy.intercept('POST', '**/verify/email', {
      statusCode: 200,
      body: { status: 'success' }
    }).as('verifyEmail');

    // Visiter la route simulée comme si l'utilisateur avait cliqué sur le lien
    cy.visit(`/auth/email?email=${email}&token=${tokenSuccess}`);

    cy.wait('@verifyEmail');

    cy.get('[data-cy=verify-message]')
      .should('contain.text', 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.');
    cy.get('mat-spinner').should('not.exist');
  });

  it('devrait gérer un lien expiré et proposer renvoi', () => {
    cy.intercept('POST', '**/verify/email', {
      statusCode: 200,
      body: { status: 'expired' }
    }).as('verifyEmail');

    cy.visit(`/auth/email?email=${email}&token=${tokenExpired}`);

    cy.wait('@verifyEmail');

    cy.get('[data-cy=verify-message]')
      .should('contain.text', 'Lien expiré. Cliquez ci-dessous pour renvoyer.');
    cy.get('[data-cy=resend-btn]').should('exist');
  });

  it('devrait gérer un lien invalide', () => {
    cy.intercept('POST', '**/verify/email', {
      statusCode: 200,
      body: { status: 'invalid' }
    }).as('verifyEmail');

    cy.visit(`/auth/email?email=${email}&token=${tokenInvalid}`);

    cy.wait('@verifyEmail');

    cy.get('[data-cy=verify-message]')
      .should('contain.text', 'Lien invalide.');
    cy.get('[data-cy=resend-btn]').should('not.exist');
  });

  it('devrait renvoyer l\'email si l\'utilisateur clique sur le bouton', () => {
    // Simuler un token expiré pour avoir le bouton
    cy.intercept('POST', '**/verify/email', { statusCode: 200, body: { status: 'expired' } }).as('verifyEmail');
    cy.intercept('POST', '**/resend/email', { statusCode: 200, body: { success: true } }).as('resendEmail');

    cy.visit(`/auth/email?email=${email}&token=${tokenExpired}`);
    cy.wait('@verifyEmail');

    cy.get('[data-cy=resend-btn]').click();

    cy.wait('@resendEmail');

    cy.get('[data-cy=verify-message]')
      .should('contain.text', 'Email renvoyé ! Vérifiez votre boîte de réception.');
    cy.get('[data-cy=verify-timer]').should('exist');
  });

  it('devrait gérer l\'erreur réseau lors de la vérification', () => {
    cy.intercept('POST', '**/verify/email', { forceNetworkError: true }).as('verifyEmail');

    cy.visit(`/auth/email?email=${email}&token=${tokenSuccess}`);
    cy.wait('@verifyEmail');

    cy.get('[data-cy=verify-message]')
      .should('contain.text', 'Erreur réseau');
  });

  it('devrait gérer l\'erreur réseau lors du renvoi', () => {
    cy.intercept('POST', '**/verify/email', { statusCode: 200, body: { status: 'expired' } }).as('verifyEmail');
    cy.intercept('POST', '**/resend/email', { forceNetworkError: true }).as('resendEmail');

    cy.visit(`/auth/email?email=${email}&token=${tokenExpired}`);
    cy.wait('@verifyEmail');

    cy.get('[data-cy=resend-btn]').click();
    cy.wait('@resendEmail');

    cy.get('[data-cy=verify-message]')
      .should('contain.text', 'Erreur lors du renvoi. Veuillez réessayer.');
    cy.get('[data-cy=resend-btn]').should('exist');
  });
});
