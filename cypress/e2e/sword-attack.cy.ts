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
        cy.get(`[data-testid="${player.id}"]`).find('.DraggableSword').should('be.visible')
      })
    })
  })
})
