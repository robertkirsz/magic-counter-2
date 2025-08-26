/// <reference types="cypress" />

describe('Monarch Stealing', () => {
  beforeEach(() => {
    cy.clearLocalStorage()

    cy.fixture('game-started.json').then(data => {
      localStorage.setItem('users', JSON.stringify(data.users))
      localStorage.setItem('decks', JSON.stringify(data.decks))
      localStorage.setItem('games', JSON.stringify(data.games))
    })

    cy.visit('/')
  })

  it('Monarch toggle is visible for players with monarch deck option', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]
      const player3 = game.players[2] // Player with Slivers deck that has monarch option

      // Wait for the game to load
      cy.get(`[data-testid="${player3.id}"]`).should('be.visible')

      // Check that the monarch toggle button is visible
      cy.get(`[data-testid="${player3.id}"]`).find('button').contains('👑').should('be.visible')
    })
  })

  it('Monarch stealing works with regular damage', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]
      const player3 = game.players[2] // Player with monarch deck
      const player1 = game.players[0] // Player without monarch deck

      // Wait for the game to load
      cy.get(`[data-testid="${player3.id}"]`).should('be.visible')

      // First, make player3 the monarch
      cy.get(`[data-testid="${player3.id}"]`).find('button').contains('👑').click()

      // Verify player3 is monarch (crown should be highlighted)
      cy.get(`[data-testid="${player3.id}"]`).find('button').contains('👑').should('have.class', 'bg-yellow-600/90')

      // Deal damage to player3 (the monarch) from player1
      cy.get(`[data-testid="${player1.id}"]`).find('[data-testid*="-remove-life"]').click()

      // Wait for the damage to be committed (debounce timeout)
      cy.wait(1600)

      // Verify that player1 is now the monarch (even though they don't have monarch deck option)
      cy.get(`[data-testid="${player1.id}"]`).find('button').contains('👑').should('have.class', 'bg-yellow-600/90')
      cy.get(`[data-testid="${player3.id}"]`).find('button').contains('👑').should('not.have.class', 'bg-yellow-600/90')
    })
  })
})
