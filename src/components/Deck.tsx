import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useUsers } from '../hooks/useUsers'
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
    <div data-testid={testIdPrefix} className="relative" {...props}>
      <div className="flex gap-1 items-start justify-between">
        <div className="flex flex-col items-start gap-1">
          <div className="flex gap-1 items-center bg-white/75 backdrop-blur-sm px-1 rounded">
            <h3 className="line-clamp-1">{deck.name}</h3>
            <ColorBadges colors={deck.colors} />
          </div>

          {showCreator && creatorName && (
            <span className="text-xs text-gray-500 bg-white/75 backdrop-blur-sm px-1 rounded">{creatorName}</span>
          )}
        </div>

        {menuVisible && (
          <ThreeDotMenu
            testId={testIdPrefix}
            onEdit={useContextControls ? handleEdit : undefined}
            onRemove={useContextControls || onRemove ? handleRemove : undefined}
          />
        )}
      </div>

      {deck.commanders.map(commander => (
        <Commander key={commander.id} commander={commander} />
      ))}

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
