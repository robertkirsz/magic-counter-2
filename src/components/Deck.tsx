import { Edit3, Trash2 } from 'lucide-react'
import React from 'react'

import { useUsers } from '../contexts/UsersContext'
import { getGradientFromColors } from '../utils/gradients'
import { ColorBadges } from './ColorBadges'
import { Commander } from './Commander'

interface DeckProps {
  deck: Deck
  onEditDeck?: (deckId: string) => void
  onRemoveDeck?: (deckId: string) => void
  showActions?: boolean
  showCreator?: boolean
  className?: string
}

export const Deck: React.FC<DeckProps> = ({
  deck,
  onEditDeck,
  onRemoveDeck,
  showActions = true,
  showCreator = false,
  className = ''
}) => {
  const { users } = useUsers()

  const getCreatorName = (deck: Deck) => {
    if (!deck.createdBy) return 'Global Deck'
    const creator = users.find(user => user.id === deck.createdBy)
    return creator ? creator.name : 'Unknown User'
  }

  const creatorName = getCreatorName(deck)
  const gradientStyle = getGradientFromColors(deck.colors)

  return (
    <div className={`rounded-lg p-1 ${className}`} style={gradientStyle}>
      <div className="flex flex-col gap-1 p-2 bg-white rounded border border-gray-200 shadow-inner">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 items-center">
            <h3 className="line-clamp-1">{deck.name}</h3>
            {showCreator && creatorName && <span className="text-sm text-gray-500">({creatorName})</span>}
            <ColorBadges colors={deck.colors} />

            {showActions && onEditDeck && onRemoveDeck && (
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => onEditDeck(deck.id)}
                  className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
                  title="Edit deck"
                >
                  <Edit3 size={16} />
                </button>

                <button
                  onClick={() => onRemoveDeck(deck.id)}
                  className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                  title="Delete deck"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {deck.commanders && deck.commanders.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {deck.commanders.map(commander => (
                <Commander key={commander.id} commander={commander} className="border border-gray-200" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
