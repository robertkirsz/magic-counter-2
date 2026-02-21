import { ChevronDown, ChevronRight, Gamepad2, User as UserIcon } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { Deck } from './Deck'
import { ThreeDotMenu } from './ThreeDotMenu'

interface UserProps {
  user: User
  onEdit: () => void
  onRemove: () => void
  onCreateDeck: () => void
}

export const User: React.FC<UserProps> = ({ user, onEdit, onRemove, onCreateDeck }) => {
  const { decks } = useDecks()
  const { games } = useGames()
  const [decksExpanded, setDecksExpanded] = useState(false)

  const filteredDecks = decks.filter(deck => deck.createdBy === user.id)

  // Calculate user statistics
  const gamesPlayed = games.filter(game => game.players.some(player => player.userId === user.id)).length

  return (
    <div className="bg-base-300 rounded-lg p-4 border border-base-300">
      {/* User Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-linear-to-br from-info to-secondary rounded-full flex items-center justify-center text-primary-content font-semibold text-lg">
          <UserIcon size={20} />
        </div>

        <div className="flex-1">
          <h3 className="text-base-content font-semibold line-clamp-1">{user.name}</h3>
        </div>

        <ThreeDotMenu onEdit={onEdit} onRemove={onRemove} />
      </div>

      {/* Statistics Section */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-base-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Gamepad2 size={16} className="text-info" />
          <span className="text-sm text-base-content/80">
            {gamesPlayed} game{gamesPlayed !== 1 ? 's' : ''} played
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span className="text-sm text-base-content/80">
            {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* User's Decks */}
      {filteredDecks.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setDecksExpanded(!decksExpanded)}
            className="flex items-center gap-2 w-full p-3 bg-base-300 rounded-lg hover:bg-base-content/10 transition-colors"
          >
            {decksExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="font-medium text-base-content">Decks ({filteredDecks.length})</span>
          </button>

          {decksExpanded && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filteredDecks.map(deck => (
                <div key={deck.id} className="shrink-0">
                  <Deck id={deck.id} useContextControls />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button className="btn btn-primary" onClick={onCreateDeck}>
        Create New Deck
      </button>
    </div>
  )
}
