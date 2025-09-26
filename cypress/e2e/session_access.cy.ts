/// <reference types="cypress" />

describe('Authentication Flow', () => {

  const apiBase = 'http://localhost:3000/api';


  describe('Login', () => {
    beforeEach(() => {
      cy.visit('/login');

      // Intercepter login
      cy.intercept('POST', `${apiBase}/auth/login`, {
        statusCode: 200,
        body: { accessToken: 'shortToken', refreshToken: 'refreshToken' }
      }).as('login');

      // Intercept /protected
      cy.intercept('GET', '**/protected', {
      statusCode: 200,
      body: { success: true }
      }).as('protected');

      // Remplir le formulaire
      cy.get('input[name=emailOrPhone]').type('marieAnge@example.com');
      cy.get('input[name=password]').type('password123');
    });

    it('se connnecter et sauvegarder le token', () => {
      cy.get('button[type=submit]').click();
      cy.wait('@login');

      // Vérifier que le token a été sauvegardé
      cy.window().its('localStorage.app_access_token').should('eq', 'shortToken');
      cy.wait('@protected');
      // Vérifier navigation
      cy.url().should('include', '/dashboard');
    });
  });


  describe('rafraichir le token une fois expiré', () => {

    beforeEach(() => {
      // Intercepts avant la visite du dashboard
      cy.intercept('GET', '**/protected', (req) => {
        const token = req.headers['authorization'];
        if (token === 'Bearer shortToken') {
          req.reply({ statusCode: 401 }); // token expiré
        } else if (token === 'Bearer newToken') {
          req.reply({ statusCode: 200, body: { success: true } });
        } else {
          req.reply({ statusCode: 401 });
        }
      }).as('protected');

      cy.intercept('POST', `${apiBase}/auth/refresh`, {
        statusCode: 200,
        body: { accessToken: 'newToken', refreshToken: 'refreshToken' }
      }).as('refresh');

      cy.window().then(win => {
        win.localStorage.setItem('app_access_token', 'shortToken');
      });

      cy.visit('/dashboard');
    });

    it('rafraichir si erreur 401 et route protégée', () => {
      // Dashboard déclenche automatiquement /protected
      cy.wait('@protected'); // 401 initial
      cy.wait('@refresh');   // refresh token
      cy.wait('@protected'); // rejoue la requête avec newToken

      // Vérifier contenu affiché
      cy.get('div').contains('success');

      // Vérifier que le nouveau token est dans localStorage
      cy.window().its('localStorage.app_access_token').should('eq', 'newToken');
    });
  });


  describe('Logout', () => {

    beforeEach(() => {
      cy.visit('/dashboard', {
        onBeforeLoad(win) {
          win.localStorage.setItem('app_access_token', 'newToken');
        }
      });
      cy.intercept('POST', 'http://localhost:3000/api/auth/logout', {
        statusCode: 200,
        body: {}
      }).as('logout');
    });

  it('supprimer token et se deconnecter', () => {
  cy.get('button#logout',{timeout: 10000 }).should('be.visible').click();

  cy.wait('@logout');

  // Vérifier que le token est supprimé
  cy.window().then(win => {
    expect(win.localStorage.getItem('app_access_token')).to.be.null;
  });
});

  });

});
