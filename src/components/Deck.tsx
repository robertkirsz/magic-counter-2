import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
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
  showStats?: boolean
  onRemove?: (deckId: string) => void
}

export const Deck: React.FC<DeckProps> = ({
  id,
  testId = '',
  testIndex = 0,
  useContextControls,
  showCreator = true,
  showStats = true,
  onRemove,
  ...props
}) => {
  const { decks, removeDeck } = useDecks()
  const { games } = useGames()
  const { users } = useUsers()

  const [deckFormVisible, setDeckFormVisible] = useState(false)

  const deck = decks.find(d => d.id === id)

  if (!deck) return <p>Deck not found</p>

  const creator = users.find(user => user.id === deck.createdBy)
  const creatorName = creator?.name || 'Global'

  // Calculate play count
  const playCount = games.reduce((count, game) => {
    return count + game.players.filter(player => player.deckId === id).length
  }, 0)

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
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{deck.name}</h3>
            <ColorBadges colors={deck.colors} />
          </div>

          <div className="flex items-center gap-3">
            {showCreator && creatorName && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                {creatorName}
              </span>
            )}

            {showStats && playCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded font-medium border border-blue-200 dark:border-blue-700 whitespace-nowrap">
                {playCount} play{playCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {menuVisible && (
          <div className="flex-shrink-0">
            <ThreeDotMenu
              testId={testIdPrefix}
              onEdit={useContextControls ? handleEdit : undefined}
              onRemove={useContextControls || onRemove ? handleRemove : undefined}
            />
          </div>
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
