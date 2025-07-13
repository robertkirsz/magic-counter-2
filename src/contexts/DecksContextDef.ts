import { createContext } from 'react'

export interface DecksContextType {
  decks: Deck[]
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt'> & { createdBy: User['id'] | null }) => Deck
  removeDeck: (deckId: string) => void
  updateDeck: (deckId: string, updates: Partial<Deck>) => void
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>
}

export const DecksContext = createContext<DecksContextType | undefined>(undefined)
