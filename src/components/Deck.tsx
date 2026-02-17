import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { ColorBadges } from './ColorBadges'
import { Commander } from './Commander'
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
    <Card className={cn('Deck border-slate-700 bg-slate-900', className)} {...props}>
      <CardContent className="flex flex-col gap-2 p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-1">{deck.name}</h3>
              <ColorBadges colors={deck.colors} />
            </div>

            <div className="flex items-center gap-2">
              {showCreator && creatorName && (
                <Badge variant="secondary" className="border-slate-600 bg-slate-700 text-slate-200">
                  {creatorName}
                </Badge>
              )}

              {showStats && playCount > 0 && (
                <Badge variant="outline" className="border-blue-700 bg-blue-900/30 text-blue-300 whitespace-nowrap">
                  {playCount} play{playCount !== 1 ? 's' : ''}
                </Badge>
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
          {deck.commanders.map(commander => (
            <Commander key={commander.id} commander={commander} className="flex-1 max-w-35" />
          ))}
        </div>

        {/* Deck Options */}
        {deck.options && deck.options.length > 0 && (
          <div className="flex items-center gap-2">
            {deck.options.map(option => (
              <Badge key={option} variant="outline" className="border-purple-700 bg-purple-900/30 text-purple-300">
                {option === 'infect' ? 'Infect' : option === 'monarch' ? 'Monarch' : option}
              </Badge>
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
      </CardContent>
    </Card>
  )
}
