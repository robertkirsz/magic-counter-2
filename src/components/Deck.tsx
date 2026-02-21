import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { getGradientFromColors } from '../utils/gradients'
import { ColorBadges } from './ColorBadges'
import { Commander } from './Commander'
import './Commander.css'
import { DeckForm } from './DeckForm'
import { Modal } from './Modal'
import { ThreeDotMenu } from './ThreeDotMenu'

interface DeckProps extends React.HTMLAttributes<HTMLDivElement> {
  id: Deck['id']
  useContextControls?: boolean
  showCreator?: boolean
  showStats?: boolean
  onRemove?: (deckId: string) => void
}

export const Deck: React.FC<DeckProps> = ({
  id,
  useContextControls,
  showCreator = true,
  showStats = true,
  className,
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
  const playCount = games.reduce((count, game) => count + game.players.filter(player => player.deckId === id).length, 0)

  const menuVisible = useContextControls || onRemove

  const handleEdit = () => {
    if (useContextControls) setDeckFormVisible(true)
  }

  const handleRemove = () => {
    if (useContextControls) removeDeck(deck.id)
    if (onRemove) onRemove(deck.id)
  }

  return (
    <div className={cn('Deck flex flex-col gap-2', className)} {...props}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1">{deck.name}</h3>
            <ColorBadges colors={deck.colors} />
          </div>

          <div className="flex items-center gap-2">
            {showCreator && creatorName && (
              <span className="text-xs bg-base-300 text-base-content/70 px-2 py-1 rounded border border-base-300">
                {creatorName}
              </span>
            )}

            {showStats && playCount > 0 && (
              <span className="text-xs bg-info/30 text-info px-2 py-1 rounded font-medium border border-info whitespace-nowrap">
                {playCount} play{playCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {menuVisible && (
          <div className="flex-none">
            <ThreeDotMenu
              onEdit={useContextControls ? handleEdit : undefined}
              onRemove={useContextControls || onRemove ? handleRemove : undefined}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {deck.commanders.length > 0 ? (
          deck.commanders.map(commander => (
            <Commander key={commander.id} commander={commander} className="flex-1 max-w-35" />
          ))
        ) : (
          <div
            className={cn('CommanderContainer flex-1 max-w-35')}
            style={getGradientFromColors(deck.colors)}
          >
            <div className="Commander">
              <div className="CommanderDetails">
                {deck.colors.length > 0 && (
                  <ColorBadges colors={deck.colors} className="flex-none mb-1" />
                )}
                <span className="text-sm/tight line-clamp-2">
                  No commander
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deck Options */}
      {deck.options && deck.options.length > 0 && (
        <div className="flex items-center gap-2">
          {deck.options.includes('infect') && <span className="badge badge-success badge-sm">Infect</span>}
          {deck.options.includes('monarch') && <span className="badge badge-secondary badge-sm">Monarch</span>}

          {deck.options
            .filter(option => option !== 'infect' && option !== 'monarch')
            .map(option => (
              <span key={option} className="badge badge-secondary badge-sm">
                {option}
              </span>
            ))}
        </div>
      )}

      {useContextControls && (
        <Modal isOpen={deckFormVisible} title="Edit Deck" onClose={() => setDeckFormVisible(false)}>
          <DeckForm
            deckId={deck.id}
            onSave={() => setDeckFormVisible(false)}
            onCancel={() => setDeckFormVisible(false)}
          />
        </Modal>
      )}
    </div>
  )
}
