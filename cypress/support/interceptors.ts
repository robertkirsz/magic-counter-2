// ***********************************************************
// Global interceptors for Cypress tests
// This file contains all the network interceptors that are
// commonly used across test files.
// ***********************************************************

/**
 * Sets up the Scryfall API interceptor
 * This intercepts all Scryfall card search requests and returns mock data
 */
export const setupScryfallInterceptor = () => {
  cy.intercept('GET', 'https://api.scryfall.com/cards/search*', {
    fixture: 'scryfall.json'
  }).as('Scryfall')

  cy.log('Scryfall interceptor set up')
}

/**
 * Sets up all common interceptors
 * Call this in your test files to set up all needed interceptors
 *
 * @example
 * // In your test file:
 * beforeEach(() => {
 *   setupAllInterceptors()
 * })
 */
export const setupAllInterceptors = () => {
  setupScryfallInterceptor()
  // Add more interceptors here as needed
}

/**
 * Individual interceptor functions for specific use cases
 * Use these if you only need specific interceptors
 *
 * @example
 * // In your test file:
 * beforeEach(() => {
 *   setupScryfallInterceptor()
 *   // Add other specific interceptors as needed
 * })
 */
