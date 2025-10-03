# MiniApp LeCoRide 

Ce projet est une application pour la commande de taxis et la gestion des utilisateurs. 
Il a été généré avec [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Architecture
app/ : module racine avec fichier de configuration appModule
core/: gestion de l'etat du projet, services singleton (navbar(headerComponent))
shared/: composants, pipes et directives reutilisables 
auth/: fonctionnalites liees a l'authentification et l'inscription(formulaire d'inscription, login, verification otp/email), guards et intercepteur
environments/: configuration pour dev/prod

## Installation et developpement

Installer les dependances
  ```bash
  npm install
  ```
Lancer le serveur de developpement:
  ```bash
  ng serve
  ```
  Ouvrir le navigateur sur `http://localhost:4200/`. Le projet se recharge automatiquement a chaque modification.


## Generation de composants, services ou modules


```bash
ng generate component nom-du-composant
ng generate service nom-du-service
ng generate module nom-du-module 
```

Pour une aide complete de generation (comme `components`, `directives`, ou `pipes`), lancer:

```bash
ng generate --help
```

## Building


```bash
ng build
```
Les artefacts sont stockes dans le dossier `dist/`. Le build de production est optimisé.


## Tests unitaires 

Framework: Jasmine + Karma [Karma](https://karma-runner.github.io)

Commande: 
```bash
ng test
```

## Tests end-to-end 

Framework: Cypress

Commande:
```bash
ng e2e
```
Scénarios couverts: 
  - Inscription d'un nouvel utilisateur
  - Verification par OTP si methode telephone et email si methode email
  - Session jwt, guards et intercepteurs, connexion et deconnexion
Angular CLI ne vient pas par défaut avec un end-to-end framework de tests. Installez celui que vous voulez.

## Lint et qualité TypeScript
Lint: ESLint
Commande:
```bash
npm run lint
```
TypeScript strict: activé
Pas de any non justifié: respecté, préféré unknown + narrowing
Respect SOLID: services decouples via interfaces, dépendances injectées, tests ciblés

## Routes Api

Auth – Login
  POST /auth/login
  Payload:

  {
    "emailOrPhone": "string",
    "password": "string"
  }
  Response (success):
  {
    "accessToken": "string",
    "refreshToken": "string" // optionnel
  }
  Response (error) : HTTP 400/401 avec message


Auth – Logout
  POST /auth/logout
  Effet : suppression des tokens côté client  côté serveur


Auth – Refresh Token
  POST /auth/refresh
  Payload :
  Si cookie HttpOnly : {}
  Sinon : { "refreshToken": "string" }
  Response (success):
  {
    "accessToken": "string",
    "refreshToken": "string" // optionnel
  }


Register – Inscription
  POST /auth-register
  Payload:
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "password": "string"
  }
  Response (success):

  {
    "success": true,
    "status": 200
  }

  Response (error):
  {
    "success": false,
    "status": 400,
    "message": "Erreur de validation"
  }


Register – Vérifier disponibilité
  GET /check-email?value=… ou /check-phone?value=…
  Response:
  {
    "available": true|false
  }


OTP – Envoi
  POST /verify/sendOtp
  Payload:

  {
    "phone": "string"
  }


OTP – Vérification
  POST /verify/otp
  Payload:

  {
    "phone": "string",
    "code": "string"
  }

  Response (success):
  {
    "status": "success"
  }
  Response (failure):

  {
    "status": "failed",
    "message": "optionnel"
  }


OTP – Renvoi
  POST /resend/otp
  Payload:
  {
    "phone": "string"
  }

  Email – Envoi vérification
  POST /verify/sendEmail
  Payload:
  {
    "email": "string"
  }


Email – Vérification
  POST /verify-email
  Payload:

  {
    "token": "string"
  }
  Response (success):

  {
    "status": "success",
    "message": "Email vérifié"
  }
  Response (expired):

  {
    "status": "expired",
    "message": "Lien expiré"
  }
  Response (invalid):
  {
    "status": "invalid",
    "message": "Token invalide"
  }


Email – Renvoi
  POST /resend/email
  Payload:
  {
    "email": "string"
  }

NB: Backend doit supporter cookie HttpOnly pour refresh token

## Lien Github



##  Resources additionnelles

Pour plus d'informations, visiter [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
