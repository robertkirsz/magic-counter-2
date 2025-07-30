/// <reference types="cypress" />

describe('Sword Attack', () => {
  beforeEach(() => {
    cy.clearLocalStorage()

    cy.fixture('game-started.json').then(data => {
      localStorage.setItem('users', JSON.stringify(data.users))
      localStorage.setItem('decks', JSON.stringify(data.decks))
      localStorage.setItem('games', JSON.stringify(data.games))
    })

    cy.visit('/')
  })

  it('Sword icons are visible when game is active', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]

      // Check that sword icons are visible for each player
      game.players.forEach(player => {
        cy.get(`[data-testid="${player.id}"]`).find('.AttackButton').should('be.visible')
      })
    })
  })

  it('Can click sword to attack another player', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]
      const firstPlayer = game.players[0]
      const secondPlayer = game.players[1]

      // Check initial life values
      cy.get(`[data-testid="${firstPlayer.id}-life"]`).should('have.text', '40')
      cy.get(`[data-testid="${secondPlayer.id}-life"]`).should('have.text', '40')

      // Click sword on first player to attack second player
      cy.get(`[data-testid="${firstPlayer.id}"]`).find('.AttackButton').click()

      // Should show attack modal
      cy.get('.Modal').should('be.visible')
      cy.get('.Modal').should('contain.text', 'Attack Player')

      // Remove life in attack modal
      cy.get(`[data-testid="${secondPlayer.id}-remove-life"]`).click({ force: true })
      cy.get(`[data-testid="${secondPlayer.id}-remove-life"]`).click({ force: true })

      // Wait for life changes to be committed
      cy.wait(1600)

      // Check that second player's life decreased
      cy.get(`[data-testid="${secondPlayer.id}-life"]`).should('have.text', '38')
    })
  })

  it('Attack modal only shows remove life button', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]
      const firstPlayer = game.players[0]
      const secondPlayer = game.players[1]

      // Click sword on first player to attack second player
      cy.get(`[data-testid="${firstPlayer.id}"]`).find('.AttackButton').click()

      // Should show attack modal
      cy.get('.Modal').should('be.visible')

      // Should have remove life button
      cy.get(`[data-testid="${secondPlayer.id}-remove-life"]`).should('be.visible')

      // Should NOT have add life button (attack mode) - look specifically in the modal
      cy.get('.Modal')
        .first()
        .within(() => {
          cy.get(`[data-testid="${secondPlayer.id}-add-life"]`).should('not.exist')
        })
    })
  })
})
