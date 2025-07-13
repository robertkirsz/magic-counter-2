import React, { type ReactNode, useEffect, useState } from 'react'

import { DecksContext, type DecksContextType } from './DecksContextDef'

interface DecksProviderProps {
  children: ReactNode
}

const LOCAL_STORAGE_KEY = 'decks'

const readDecks = (): Deck[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) return JSON.parse(stored).map((deck: Deck) => ({ ...deck, createdAt: new Date(deck.createdAt) }))
  return []
}

export const DecksProvider: React.FC<DecksProviderProps> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>(readDecks())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decks)), [decks])

  const addDeck = (deckData: Omit<Deck, 'id' | 'createdAt'> & { createdBy: User['id'] | null }) => {
    const newDeck: Deck = {
      ...deckData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }

    setDecks(prev => [...prev, newDeck])

    return newDeck
  }

  const removeDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId))
  }

  const updateDeck = (deckId: string, updates: Partial<Deck>) => {
    setDecks(prev => prev.map(deck => (deck.id === deckId ? { ...deck, ...updates } : deck)))
  }

  const value: DecksContextType = {
    decks,
    addDeck,
    removeDeck,
    updateDeck,
    setDecks
  }

  return <DecksContext.Provider value={value}>{children}</DecksContext.Provider>
}
