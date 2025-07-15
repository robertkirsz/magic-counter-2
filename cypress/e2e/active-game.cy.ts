describe('Active Game', () => {
  beforeEach(() => {
    cy.clearLocalStorage()

    cy.fixture('game-started.json').then(data => {
      localStorage.setItem('users', JSON.stringify(data.users))
      localStorage.setItem('decks', JSON.stringify(data.decks))
      localStorage.setItem('games', JSON.stringify(data.games))
    })

    cy.visit('/')
  })

  it('Each player has 40 life', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]

      game.players.forEach((player, idx) => {
        cy.get(`[data-testid="player-${idx + 1}-life"]`).should('have.text', '40')
      })
    })
  })
})
