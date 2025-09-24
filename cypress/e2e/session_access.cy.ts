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

      // Remplir le formulaire
      cy.get('input[name=email]').type('test@example.com');
      cy.get('input[name=password]').type('password123');
    });

    it('should login successfully and store access token', () => {
      cy.get('button[type=submit]').click();
      cy.wait('@login');

      // Vérifier que le token a été sauvegardé
      cy.window().its('localStorage.app_access_token').should('eq', 'shortToken');

      // Vérifier navigation
      cy.url().should('include', '/dashboard');
    });
  });


  describe('Access protected route with token refresh', () => {

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

      // Définir le token initial pour simuler utilisateur déjà connecté
      cy.window().then(win => {
        win.localStorage.setItem('app_access_token', 'shortToken');
      });

      cy.visit('/dashboard');
    });

    it('should refresh token on 401 and access protected data', () => {
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
      cy.visit('/dashboard');

      // Simuler token connecté
      cy.window().then(win => {
        win.localStorage.setItem('app_access_token', 'newToken');
      });

      // Ajouter le bouton logout si pas encore dans ton template
      cy.document().then(doc => {
        if (!doc.querySelector('#logout')) {
          const btn = doc.createElement('button');
          btn.id = 'logout';
          btn.textContent = 'Logout';
          btn.onclick = () => localStorage.removeItem('app_access_token');
          doc.body.appendChild(btn);
        }
      });

      // Intercepter la requête logout
      cy.intercept('POST', 'http://localhost:3000/api/auth/logout', {
        statusCode: 200,
        body: {}
      }).as('logout');
    });

  it('should clear access token on logout', () => {
  cy.get('button#logout').should('be.visible').click();

  // Attendre la requête logout
  cy.wait('@logout');

  // Vérifier que le token est supprimé
  cy.window().then(win => {
    expect(win.localStorage.getItem('app_access_token')).to.be.null;
  });
});

  });

});
