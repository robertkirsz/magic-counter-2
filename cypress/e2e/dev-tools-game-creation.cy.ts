/// <reference types="cypress" />

describe('DevTools Panel Game Creation', () => {
  beforeEach(() => {
    cy.clearLocalStorage()

    // Load test data with users and decks
    cy.fixture('game-started.json').then(data => {
      localStorage.setItem('users', JSON.stringify(data.users))
      localStorage.setItem('decks', JSON.stringify(data.decks))
      localStorage.setItem('games', JSON.stringify([])) // Start with no games
    })

    cy.visit('/')
  })

  const openDevTools = () => {
    cy.get('[data-testid="dev-tools-button"]').click()
    cy.get('[data-testid="dev-tools-panel"]').should('be.visible')
  }

  const getGameTypeRadio = (type: string) => {
    return cy.get(`input[name="gameType"][value="${type}"]`)
  }

  const getGameStateRadio = (state: string) => {
    return cy.get(`input[name="gameState"][value="${state}"]`)
  }

  it('should open dev tools panel and show game creation controls', () => {
    openDevTools()

    // Check that game type radio buttons are present
    cy.get('label').contains('Game Type:').should('be.visible')
    getGameTypeRadio('untracked').should('be.visible')
    getGameTypeRadio('tracked').should('be.visible')
    getGameTypeRadio('random').should('be.visible')

    // Check that game state radio buttons are present
    cy.get('label').contains('Game State:').should('be.visible')
    getGameStateRadio('setup').should('be.visible')
    getGameStateRadio('active').should('be.visible')
    getGameStateRadio('finished').should('be.visible')

    // Check that Add Game button is present
    cy.get('button[title="Add Game"]').should('be.visible')
  })

  it('should create untracked setup game', () => {
    openDevTools()

    // Select untracked game type
    getGameTypeRadio('untracked').check()

    // Select setup game state
    getGameStateRadio('setup').check()

    // Click Add Game button
    cy.get('button[title="Add Game"]').click()

    // Verify game was created with correct properties
    cy.window().then(() => {
      const games = JSON.parse(localStorage.getItem('games') || '[]')
      expect(games).to.have.length(1)

      const game = games[0]
      expect(game.turnTracking).to.be.false
      expect(game.state).to.equal('setup')
      expect(game.players).to.have.length.greaterThan(0)
    })
  })

  it('should create tracked active game', () => {
    openDevTools()

    // Select tracked game type
    getGameTypeRadio('tracked').check()

    // Select active game state
    getGameStateRadio('active').check()

    // Click Add Game button
    cy.get('button[title="Add Game"]').click()

    // Verify game was created with correct properties
    cy.window().then(() => {
      const games = JSON.parse(localStorage.getItem('games') || '[]')
      expect(games).to.have.length(1)

      const game = games[0]
      expect(game.turnTracking).to.be.true
      expect(game.state).to.equal('active')
      expect(game.players).to.have.length.greaterThan(0)
    })
  })

  it('should create random finished game', () => {
    openDevTools()

    // Select random game type (should be default)
    getGameTypeRadio('random').should('be.checked')

    // Select finished game state
    getGameStateRadio('finished').check()

    // Click Add Game button
    cy.get('button[title="Add Game"]').click()

    // Verify game was created with correct properties
    cy.window().then(() => {
      const games = JSON.parse(localStorage.getItem('games') || '[]')
      expect(games).to.have.length(1)

      const game = games[0]
      expect(game.state).to.equal('finished')
      expect(game.players).to.have.length.greaterThan(0)
      // For random type, turnTracking can be either true or false (default from generator)
      expect(typeof game.turnTracking).to.equal('boolean')
    })
  })

  it('should create multiple games with different settings', () => {
    openDevTools()

    // Create first game: untracked setup
    getGameTypeRadio('untracked').check({ force: true })
    getGameStateRadio('setup').check({ force: true })
    cy.get('button[title="Add Game"]').click({ force: true })

    // Wait for any modals to close and UI to stabilize
    cy.wait(1000)

    // Create second game: tracked active
    getGameTypeRadio('tracked').check({ force: true })
    getGameStateRadio('active').check({ force: true })
    cy.get('button[title="Add Game"]').click({ force: true })

    // Wait for any modals to close and UI to stabilize
    cy.wait(1000)

    // Create third game: random finished
    getGameTypeRadio('random').check({ force: true })
    getGameStateRadio('finished').check({ force: true })
    cy.get('button[title="Add Game"]').click({ force: true })

    // Verify all games were created with correct properties
    cy.window().then(() => {
      const games = JSON.parse(localStorage.getItem('games') || '[]')
      expect(games).to.have.length(3)

      // First game: untracked setup
      expect(games[0].turnTracking).to.be.false
      expect(games[0].state).to.equal('setup')

      // Second game: tracked active
      expect(games[1].turnTracking).to.be.true
      expect(games[1].state).to.equal('active')

      // Third game: random finished
      expect(games[2].state).to.equal('finished')
      expect(typeof games[2].turnTracking).to.equal('boolean')
    })
  })

  it('should maintain radio button selections after creating games', () => {
    openDevTools()

    // Set specific selections
    getGameTypeRadio('tracked').check()
    getGameStateRadio('finished').check()

    // Create a game
    cy.get('button[title="Add Game"]').click()

    // Verify selections are still maintained
    getGameTypeRadio('tracked').should('be.checked')
    getGameStateRadio('finished').should('be.checked')

    // Create another game with same settings
    cy.get('button[title="Add Game"]').click()

    // Verify both games were created
    cy.window().then(() => {
      const games = JSON.parse(localStorage.getItem('games') || '[]')
      expect(games).to.have.length(2)

      // Both games should have the same settings
      games.forEach(game => {
        expect(game.turnTracking).to.be.true
        expect(game.state).to.equal('finished')
      })
    })
  })

  it('should handle game creation with no users or decks gracefully', () => {
    // Clear localStorage to start with no data
    cy.clearLocalStorage()
    cy.visit('/')

    openDevTools()

    // Try to create a game with no users/decks
    getGameTypeRadio('untracked').check()
    getGameStateRadio('setup').check()
    cy.get('button[title="Add Game"]').click()

    // Should show an error alert
    cy.on('window:alert', str => {
      expect(str).to.include('Failed to generate game')
    })
  })

  it('should have correct default selections', () => {
    openDevTools()

    // Default should be random game type and active game state
    getGameTypeRadio('random').should('be.checked')
    getGameStateRadio('active').should('be.checked')
  })

  it('should generate both tracked and untracked games with random option', () => {
    openDevTools()

    // Create multiple random games
    for (let i = 0; i < 10; i++) {
      getGameTypeRadio('random').check({ force: true })
      getGameStateRadio('active').check({ force: true })
      cy.get('button[title="Add Game"]').click({ force: true })
      cy.wait(200) // Small wait between creations
    }

    // Verify we have a mix of tracked and untracked games
    cy.window().then(() => {
      const games = JSON.parse(localStorage.getItem('games') || '[]')
      expect(games).to.have.length(10)

      const trackedGames = games.filter(game => game.turnTracking === true)
      const untrackedGames = games.filter(game => game.turnTracking === false)

      // We should have both types (the exact numbers will vary due to randomness)
      expect(trackedGames.length).to.be.greaterThan(0)
      expect(untrackedGames.length).to.be.greaterThan(0)

      // All games should be in active state
      games.forEach(game => {
        expect(game.state).to.equal('active')
      })
    })
  })

  it('should create finished games with actions', () => {
    openDevTools()

    // Create untracked finished game
    getGameTypeRadio('untracked').check({ force: true })
    getGameStateRadio('finished').check({ force: true })
    cy.get('button[title="Add Game"]').click({ force: true })

    // Verify the game was created with actions
    cy.window().then(() => {
      const games = JSON.parse(localStorage.getItem('games') || '[]')
      expect(games).to.have.length(1)

      const game = games[0]
      expect(game.state).to.equal('finished')
      expect(game.turnTracking).to.be.false
      expect(game.actions).to.have.length.greaterThan(0)
      expect(game.actions[0]).to.have.property('type')
    })
  })
})
