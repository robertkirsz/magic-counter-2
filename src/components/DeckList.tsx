import React from 'react'

import { useUsers } from '../contexts/UsersContext'

interface DeckListProps {
  decks: Deck[]
  onEditDeck?: (deckId: string) => void
  onRemoveDeck?: (deckId: string) => void
  filterByUser?: string // User ID to filter decks by
  showActions?: boolean // Whether to show edit/delete buttons
  title?: string
}

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  onEditDeck,
  onRemoveDeck,
  filterByUser,
  showActions = true,
  title = 'Current Decks'
}) => {
  const { users } = useUsers()

  const getColorLabels = (colors: ManaColor[]) => {
    const colorMap: Record<ManaColor, string> = {
      W: 'White',
      U: 'Blue',
      B: 'Black',
      R: 'Red',
      G: 'Green',
      C: 'Colorless'
    }
    return colors.map(color => colorMap[color]).join(', ')
  }

  const getCreatorName = (deck: Deck) => {
    if (!deck.createdBy) {
      return 'Global Deck'
    }
    const creator = users.find(user => user.id === deck.createdBy)
    return creator ? creator.name : 'Unknown User'
  }

  // Filter decks if filterByUser is provided
  const filteredDecks = filterByUser ? decks.filter(deck => deck.createdBy === filterByUser) : decks

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {filteredDecks.length === 0 ? (
        <p className="text-gray-500 italic">
          {filterByUser ? 'No decks created by this user yet.' : 'No decks yet. Add your first deck!'}
        </p>
      ) : (
        <div>
          {filteredDecks.map(deck => (
            <div key={deck.id} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold mb-1">{deck.name}</h3>
                  <p className="text-gray-500 mb-1">Created: {deck.createdAt.toLocaleDateString()}</p>
                  {!filterByUser && <p className="text-gray-500 mb-1">Creator: {getCreatorName(deck)}</p>}
                  <p className="mb-1">
                    <span className="font-medium">Colors:</span> {getColorLabels(deck.colors)}
                  </p>
                  {deck.commanders && deck.commanders.length > 0 && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Commanders:</span> {deck.commanders.join(', ')}
                    </p>
                  )}
                </div>
                {showActions && onEditDeck && onRemoveDeck && (
                  <div>
                    <button
                      onClick={() => onEditDeck(deck.id)}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveDeck(deck.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
