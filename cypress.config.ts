import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 5000,
    requestTimeout: 5000,
    responseTimeout: 5000,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents() {
      // implement node event listeners here
    }
  }
})
