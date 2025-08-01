/// <reference types="cypress" />

describe('No Turn Tracking', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('Creates a game without turn tracking and starts immediately', () => {
    // Click "New Game" button
    cy.get('[data-testid="game-form-modal"]').should('not.exist')
    cy.get('button').contains('New Game').click()

    // Wait for game form to appear
    cy.get('[data-testid="game-form-modal"]').should('be.visible')

    // Uncheck turn tracking (the last checkbox)
    cy.get('input[type="checkbox"]').last().uncheck()

    // Set number of players to 4
    cy.get('button').contains('4').click()

    // Create the game
    cy.get('button').contains('Create').click()

    // The game should start immediately (no setup state)
    // We should be on the board with the game active
    cy.get('.Board').should('be.visible')

    // Check that the game is in active state (no START button visible)
    cy.get('span').contains('START').should('not.exist')

    // Check that we can modify life totals immediately
    cy.get('[data-testid="player-1-life"]').should('be.visible')
    cy.get('[data-testid="player-1-add-life"]').click()
    cy.get('[data-testid="player-1-life"]').should('contain', '41')
  })

  it('Games with turn tracking still require setup', () => {
    // Click "New Game" button
    cy.get('button').contains('New Game').click()

    // Keep turn tracking checked (default)
    cy.get('input[type="checkbox"]').last().should('be.checked')

    // Set number of players to 4
    cy.get('button').contains('4').click()

    // Create the game
    cy.get('button').contains('Create').click()

    // The game should be in setup state (START button visible)
    cy.get('span').contains('START').should('be.visible')
    // The START button should be disabled because no players are assigned
    cy.get('span').contains('START').closest('button').should('be.disabled')
  })
})
