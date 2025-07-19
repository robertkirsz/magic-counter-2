import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { DecksContext, type DecksContextType } from './DecksContextDef'

interface DecksProviderProps {
  children: React.ReactNode
}

const LOCAL_STORAGE_KEY = 'decks'

const readDecks = (): Deck[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (stored) return JSON.parse(stored).map((deck: Deck) => ({ ...deck, createdAt: new Date(deck.createdAt) }))

    return []
  } catch (e) {
    window.alert(
      `Could not load deck data from localStorage (key: ${LOCAL_STORAGE_KEY}).\nError: ${e instanceof Error ? e.message : e}`
    )

    if (window.confirm('Clear the corrupted data and load default state?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      window.location.reload()
    }

    return []
  }
}

export const DecksProvider: React.FC<DecksProviderProps> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>(readDecks())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decks)), [decks])

  const addDeck = (deckData: Omit<Deck, 'id' | 'createdAt'> & { createdBy: User['id'] | null }) => {
    const newDeck: Deck = {
      ...deckData,
      id: uuidv4(),
      createdAt: DateTime.now().toJSDate()
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
