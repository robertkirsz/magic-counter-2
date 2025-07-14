describe('CRUD Operations', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  const createUser = (name: string) => {
    cy.get('[data-testid="user-form-create-modal"]').should('be.visible')
    cy.get('[data-testid="user-form-create-name"]').type(name)
    cy.get('[data-testid="user-form-create-save"]').click()
  }

  const createDeck = (name: string) => {
    cy.get('[data-testid="deck-form-create-name"]').type(name)
    cy.get('[data-testid="mana-W"]').click()
    cy.get('[data-testid="deck-form-create-save"]').click()
  }

  it('Works', () => {
    cy.get('[data-testid="intro-screen-users-button"]').click()
    cy.get('[data-testid="users-add"]').click()

    createUser('Test User')

    cy.get('[data-testid="user-0"]').should('contain', 'Test User')

    cy.get('[data-testid="user-0-..."').click()
    cy.get('[data-testid="user-0-...-edit"]').click()

    cy.get('[data-testid="user-form-edit-name"]').type(' Edited')
    cy.get('[data-testid="user-form-edit-save"]').click()

    cy.get('[data-testid="user-0"]').should('contain', 'Test User Edited')

    cy.get('[data-testid="user-0-create-deck"]').click()

    createDeck('Test Deck')

    cy.get('[data-testid="deck-0"]').should('contain', 'Test Deck')

    cy.get('[data-testid="deck-0-..."').click()
    cy.get('[data-testid="deck-0-...-edit"]').click()

    cy.get('[data-testid="deck-form-edit-name"]').type(' Edited')
    cy.get('[data-testid="deck-form-edit-save"]').click()

    cy.get('[data-testid="deck-0"]').should('contain', 'Test Deck Edited')
  })
})
