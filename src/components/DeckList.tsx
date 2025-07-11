import React from 'react'

import { useUsers } from '../contexts/UsersContext'
import { Deck } from './Deck'

interface DeckListProps {
  decks: Deck[]
  onEditDeck?: (deckId: string) => void
  onRemoveDeck?: (deckId: string) => void
  filterByUser?: string // User ID to filter decks by
  showActions?: boolean // Whether to show edit/delete buttons
}

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  onEditDeck,
  onRemoveDeck,
  filterByUser,
  showActions = true
}) => {
  const { users } = useUsers()

  const getCreatorName = (deck: Deck) => {
    if (!deck.createdBy) return 'Global Deck'
    const creator = users.find(user => user.id === deck.createdBy)
    return creator ? creator.name : 'Unknown User'
  }

  const filteredDecks = filterByUser ? decks.filter(deck => deck.createdBy === filterByUser) : decks

  return (
    <div className="flex flex-col gap-2">
      {filteredDecks.length === 0 ? (
        <p className="text-gray-500 italic">
          {filterByUser ? 'No decks created by this user yet.' : 'No decks yet. Add your first deck!'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredDecks.map(deck => (
            <Deck
              key={deck.id}
              deck={deck}
              onEditDeck={onEditDeck}
              onRemoveDeck={onRemoveDeck}
              showActions={showActions}
              showCreator={!filterByUser}
              creatorName={!filterByUser ? getCreatorName(deck) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
