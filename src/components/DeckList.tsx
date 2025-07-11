import { Edit3, Trash2 } from 'lucide-react'
import React from 'react'

import { useUsers } from '../contexts/UsersContext'
import { ColorBadges } from './ColorBadges'
import { Commander } from './Commander'

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
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      {filteredDecks.length === 0 ? (
        <p className="text-gray-500 italic">
          {filterByUser ? 'No decks created by this user yet.' : 'No decks yet. Add your first deck!'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredDecks.map(deck => (
            <div key={deck.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex gap-2 justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1 items-baseline">
                    <h3>{deck.name}</h3>
                    {!filterByUser && <span className="text-sm text-gray-500">({getCreatorName(deck)})</span>}
                    <ColorBadges colors={deck.colors} />
                  </div>

                  {deck.commanders && deck.commanders.length > 0 && (
                    <div className="space-y-1">
                      {deck.commanders.map((commander, index) => (
                        <div key={index} className="bg-white rounded border border-gray-200">
                          <Commander commander={commander} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showActions && onEditDeck && onRemoveDeck && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditDeck(deck.id)}
                      className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                      title="Edit deck"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() => onRemoveDeck(deck.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      title="Delete deck"
                    >
                      <Trash2 size={16} />
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
