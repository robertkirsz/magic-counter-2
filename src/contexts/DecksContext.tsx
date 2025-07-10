import React, { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface DecksContextType {
  decks: Deck[]
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt'>) => Deck
  removeDeck: (deckId: string) => void
  updateDeck: (deckId: string, updates: Partial<Deck>) => void
}

const DecksContext = createContext<DecksContextType | undefined>(undefined)

interface DecksProviderProps {
  children: ReactNode
}

const LOCAL_STORAGE_KEY = 'decks'

const readDecks = (): Deck[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) return JSON.parse(stored).map((d: any) => ({ ...d, createdAt: new Date(d.createdAt) }))
  return []
}

export const DecksProvider: React.FC<DecksProviderProps> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>(readDecks())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decks)), [decks])

  const addDeck = (deckData: Omit<Deck, 'id' | 'createdAt'>) => {
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
    updateDeck
  }

  return <DecksContext.Provider value={value}>{children}</DecksContext.Provider>
}

export const useDecks = (): DecksContextType => {
  const context = useContext(DecksContext)
  if (context === undefined) throw new Error('useDecks must be used within a DecksProvider')
  return context
}
