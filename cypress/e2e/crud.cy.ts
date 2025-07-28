/// <reference types="cypress" />

describe('CRUD Operations', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  const createUser = (name: string) => {
    cy.get('[data-testid="user-form-create"]').should('be.visible')
    cy.get('[data-testid="user-form-create-name"]').type(name)
    cy.get('[data-testid="user-form-create-save"]').click()
  }

  const createDeck = (name: string, commanderIndex = 0) => {
    cy.get('[data-testid="deck-form-create"]').should('be.visible')
    cy.get('[data-testid="deck-form-create-name"]').type(name)
    cy.get('[data-testid="commander-search-input"]').type('Test')
    cy.wait('@Scryfall')
    cy.get(`[data-testid="commander-${commanderIndex}"]`).click()
    cy.get('[data-testid="deck-form-create-save"]').click()
  }

  it('Allows to add, edit and delete users', () => {
    cy.get('[data-testid="intro-screen-users-button"]').click()
    cy.get('[data-testid="users-add"]').click()

    createUser('Test User')

    cy.get('[data-testid="user-0"]').should('contain', 'Test User')

    cy.get('[data-testid="user-0-..."').click()
    cy.get('[data-testid="user-0-...-edit"]').click()

    cy.get('[data-testid="user-form-edit-name"]').type(' Edited')
    cy.get('[data-testid="user-form-edit-save"]').click()

    cy.get('[data-testid="user-0"]').should('contain', 'Test User Edited')
  })

  it('Allows to add, edit and delete decks', () => {
    cy.get('[data-testid="intro-screen-decks-button"]').click()

    cy.get('[data-testid="decks-add"]').click()

    createDeck('Test Deck')

    cy.get('[data-testid="deck-0"]').should('contain', 'Test Deck')
    cy.get('[data-testid="commander-0-0"]').should('be.visible')

    cy.get('[data-testid="decks-add"]').click()

    createDeck('Test Deck 2', 1)

    cy.get('[data-testid="deck-0"]').should('contain', 'Test Deck')
    cy.get('[data-testid="commander-0-0"]').should('be.visible')

    cy.get('[data-testid="deck-1"]').should('contain', 'Test Deck 2')
    cy.get('[data-testid="commander-1-0"]').should('be.visible')
  })
})
