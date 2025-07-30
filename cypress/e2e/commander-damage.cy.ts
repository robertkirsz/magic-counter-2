/// <reference types="cypress" />

describe('Commander Damage', () => {
  beforeEach(() => {
    cy.clearLocalStorage()

    cy.fixture('game-started.json').then(data => {
      localStorage.setItem('users', JSON.stringify(data.users))
      localStorage.setItem('decks', JSON.stringify(data.decks))
      localStorage.setItem('games', JSON.stringify(data.games))
    })

    cy.visit('/')
  })

  it('Shows commander damage checkbox when game has commanders enabled', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]

      // Check that commander damage checkboxes are visible for each player
      game.players.forEach(player => {
        cy.get(`[data-testid="${player.id}"]`).within(() => {
          cy.get('input[type="checkbox"]').should('exist')
          cy.get('label').contains('Commander damage').should('exist')
        })
      })
    })
  })

  it('Attaches commander ID when commander damage is checked', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]
      const player = game.players[0]
      const playerDeck = data.decks.find(d => d.id === player.deckId)
      const commanderId = playerDeck?.commanders?.[0]?.id

      // Check the commander damage checkbox
      cy.get(`[data-testid="${player.id}"]`).within(() => {
        cy.get('input[type="checkbox"]').check()
      })

      // Deal damage
      cy.get(`[data-testid="${player.id}-remove-life"]`).click()
      cy.get(`[data-testid="${player.id}-remove-life"]`).click()

      // Wait for the action to be committed
      cy.wait(1600)

      // Verify the action was created with commander ID
      cy.window().then(() => {
        const games = JSON.parse(localStorage.getItem('games') || '[]')
        const updatedGame = games.find(g => g.id === game.id)
        const lifeChangeActions = updatedGame.actions.filter(a => a.type === 'life-change')
        const lastAction = lifeChangeActions[lifeChangeActions.length - 1]

        cy.wrap(lastAction.commanderId).should('equal', commanderId)
        cy.wrap(lastAction.value).should('equal', -2)
      })
    })
  })

  it('Does not attach commander ID when commander damage is not checked', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]
      const player = game.players[0]

      // Deal damage without checking commander damage
      cy.get(`[data-testid="${player.id}-remove-life"]`).click()
      cy.get(`[data-testid="${player.id}-remove-life"]`).click()

      // Wait for the action to be committed
      cy.wait(1600)

      // Verify the action was created without commander ID
      cy.window().then(() => {
        const games = JSON.parse(localStorage.getItem('games') || '[]')
        const updatedGame = games.find(g => g.id === game.id)
        const lifeChangeActions = updatedGame.actions.filter(a => a.type === 'life-change')
        const lastAction = lifeChangeActions[lifeChangeActions.length - 1]

        cy.wrap(lastAction.commanderId).should('be.undefined')
        cy.wrap(lastAction.value).should('equal', -2)
      })
    })
  })

  it('Commander damage checkbox resets after action is committed', () => {
    cy.fixture('game-started.json').then(data => {
      const game = data.games[0]
      const player = game.players[0]

      // Check the commander damage checkbox
      cy.get(`[data-testid="${player.id}"]`).within(() => {
        cy.get('input[type="checkbox"]').check()
        cy.get('input[type="checkbox"]').should('be.checked')
      })

      // Deal damage
      cy.get(`[data-testid="${player.id}-remove-life"]`).click()

      // Wait for the action to be committed
      cy.wait(1600)

      // Verify the checkbox is unchecked
      cy.get(`[data-testid="${player.id}"]`).within(() => {
        cy.get('input[type="checkbox"]').should('not.be.checked')
      })
    })
  })
})
