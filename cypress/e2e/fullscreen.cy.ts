/// <reference types="cypress" />

describe('Fullscreen Functionality', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('should show fullscreen button in board settings menu', () => {
    // Create a game first to access the board
    cy.get('button').contains('New Game').click()
    cy.get('button').contains('4').click()
    cy.get('button').contains('Create').click()

    // Open settings menu
    cy.get('button[title*="Settings"]').click()

    // Check that the fullscreen button is visible in the settings menu
    cy.get('button').contains('Fullscreen').should('be.visible')
  })

  it('should toggle fullscreen state when button is clicked', () => {
    // Create a game first to access the board
    cy.get('button').contains('New Game').click()
    cy.get('button').contains('4').click()
    cy.get('button').contains('Create').click()

    // Open settings menu
    cy.get('button[title*="Settings"]').click()

    // Click the fullscreen button
    cy.get('button').contains('Fullscreen').click()

    // The settings menu should close after clicking, so we need to reopen it to check the state
    cy.get('button[title*="Settings"]').click()

    // The button text should change to "Exit Fullscreen" when in fullscreen mode
    cy.get('button').contains('Exit Fullscreen').should('be.visible')
  })

  it('should show correct icon based on fullscreen state', () => {
    // Create a game first to access the board
    cy.get('button').contains('New Game').click()
    cy.get('button').contains('4').click()
    cy.get('button').contains('Create').click()

    // Open settings menu
    cy.get('button[title*="Settings"]').click()

    // Initially should show Fullscreen button
    cy.get('button').contains('Fullscreen').should('be.visible')

    // Click to toggle
    cy.get('button').contains('Fullscreen').first().click()

    // Reopen settings menu to check the new state
    cy.get('button[title*="Settings"]').click()

    // Should show Exit Fullscreen button when in fullscreen mode
    cy.get('button').contains('Exit Fullscreen').should('be.visible')
  })
})
