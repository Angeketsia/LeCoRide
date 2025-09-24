import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    defaultCommandTimeout: 8000,   // augmente le délai max
    responseTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
     specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}", // seulement les .cy.ts
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      // event listeners
    },
  },
});
