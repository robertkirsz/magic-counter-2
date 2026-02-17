import { ChevronDown, ChevronRight, Gamepad2, User as UserIcon } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { Button } from './Button'
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
    <Card className="border-slate-700 bg-slate-900">
      <CardContent className="p-4">
      {/* User Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          <UserIcon size={20} />
        </div>

        <div className="flex-1">
          <h3 className="text-white font-semibold line-clamp-1">{user.name}</h3>
        </div>

        <ThreeDotMenu onEdit={onEdit} onRemove={onRemove} />
      </div>

      {/* Statistics Section */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-800 rounded-lg">
        <Badge variant="secondary" className="flex items-center gap-2 border-none bg-transparent px-0 py-0 text-gray-300">
          <Gamepad2 size={16} className="text-blue-400" />
          <span className="text-sm">
            {gamesPlayed} game{gamesPlayed !== 1 ? 's' : ''} played
          </span>
        </Badge>

        <Badge variant="secondary" className="flex items-center gap-2 border-none bg-transparent px-0 py-0 text-gray-300">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">
            {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''}
          </span>
        </Badge>
      </div>

      {/* User's Decks */}
      {filteredDecks.length > 0 && (
        <div className="mb-4">
          <Button
            variant="secondary"
            onClick={() => setDecksExpanded(!decksExpanded)}
            className="h-auto w-full justify-start p-3"
          >
            {decksExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="font-medium text-gray-100">Decks ({filteredDecks.length})</span>
          </Button>

          {decksExpanded && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filteredDecks.map(deck => (
                <div key={deck.id} className="flex-shrink-0">
                  <Deck id={deck.id} useContextControls />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Button variant="primary" onClick={onCreateDeck}>
        Create New Deck
      </Button>
      </CardContent>
    </Card>
  )
}
