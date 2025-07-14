import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useUsers } from '../hooks/useUsers'
import { getGradientFromColors } from '../utils/gradients'
import { ColorBadges } from './ColorBadges'
import { Commander } from './Commander'
import { DeckForm } from './DeckForm'
import { ThreeDotMenu } from './ThreeDotMenu'

interface DeckProps extends React.HTMLAttributes<HTMLDivElement> {
  id: Deck['id']
  testId?: string
  testIndex?: number
  useContextControls?: boolean
  showCreator?: boolean
  onRemove?: (deckId: string) => void
}

export const Deck: React.FC<DeckProps> = ({
  id,
  testId = '',
  testIndex = 0,
  useContextControls,
  showCreator = true,
  onRemove,
  ...props
}) => {
  const { decks, removeDeck } = useDecks()
  const { users } = useUsers()

  const [deckFormVisible, setDeckFormVisible] = useState(false)

  const deck = decks.find(d => d.id === id)

  if (!deck) return <p>Deck not found</p>

  const creator = users.find(user => user.id === deck.createdBy)
  const creatorName = creator?.name || 'Global'

  const gradientStyle = getGradientFromColors(deck.colors)
  const menuVisible = useContextControls || onRemove

  const handleEdit = () => {
    if (useContextControls) setDeckFormVisible(true)
  }

  const handleRemove = () => {
    if (useContextControls) removeDeck(deck.id)
    if (onRemove) onRemove(deck.id)
  }

  const testIdPrefix = testId ? `${testId}-deck-${testIndex}` : `deck-${testIndex}`

  return (
    <div data-testid={testIdPrefix} className="rounded-lg p-1 border border-gray-200" style={gradientStyle} {...props}>
      <div className="flex flex-col gap-1 p-2 bg-white rounded">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 items-center">
            <h3 className="line-clamp-1">{deck.name}</h3>

            <ColorBadges colors={deck.colors} />

            {showCreator && creatorName && <span className="text-sm text-gray-500">({creatorName})</span>}

            {menuVisible && (
              <ThreeDotMenu
                testId={testIdPrefix}
                onEdit={useContextControls ? handleEdit : undefined}
                onRemove={useContextControls || onRemove ? handleRemove : undefined}
              />
            )}
          </div>

          {deck.commanders && deck.commanders.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {deck.commanders.map(commander => (
                <Commander key={commander.id} commander={commander} />
              ))}
            </div>
          )}
        </div>
      </div>

      {useContextControls && deckFormVisible && (
        <DeckForm
          deckId={deck.id}
          onSave={() => setDeckFormVisible(false)}
          onCancel={() => setDeckFormVisible(false)}
        />
      )}
    </div>
  )
}
