import React, { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface DecksContextType {
  decks: Decks[]
  addDeck: (deck: Omit<Decks, 'id' | 'createdAt'>) => void
  removeDeck: (deckId: string) => void
  updateDeck: (deckId: string, updates: Partial<Decks>) => void
}

const DecksContext = createContext<DecksContextType | undefined>(undefined)

interface DecksProviderProps {
  children: ReactNode
}

const LOCAL_STORAGE_KEY = 'decks'

const readDecks = (): Decks[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) return JSON.parse(stored).map((d: any) => ({ ...d, createdAt: new Date(d.createdAt) }))
  return []
}

export const DecksProvider: React.FC<DecksProviderProps> = ({ children }) => {
  const [decks, setDecks] = useState<Decks[]>(readDecks())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decks)), [decks])

  const addDeck = (deckData: Omit<Decks, 'id' | 'createdAt'>) => {
    const newDeck: Decks = {
      ...deckData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }

    setDecks(prev => [...prev, newDeck])
  }

  const removeDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId))
  }

  const updateDeck = (deckId: string, updates: Partial<Decks>) => {
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
