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

      game.players.forEach(player => {
        cy.get(`[data-testid="${player.id}-life"]`).should('have.text', '40')

        cy.get(`[data-testid="${player.id}-add-life"]`).click()
        cy.get(`[data-testid="${player.id}-add-life"]`).click()
        cy.get(`[data-testid="${player.id}-add-life"]`).click()

        cy.get(`[data-testid="${player.id}-life"]`).should('have.text', '43')
      })

      // Wait for the life changes to be committed
      cy.wait(1600)

      game.players.forEach(player => {
        cy.get(`[data-testid="${player.id}-life"]`).should('have.text', '43')
      })
    })
  })
})
