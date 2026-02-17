import { ChevronDown, ChevronRight, Gamepad2, User as UserIcon } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { Button } from './Button'
import { Deck } from './Deck'
import { ThreeDotMenu } from './ThreeDotMenu'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

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

  const gamesPlayed = games.filter(game => game.players.some(player => player.userId === user.id)).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            <UserIcon size={18} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold line-clamp-1">{user.name}</h3>
          </div>

          <ThreeDotMenu onEdit={onEdit} onRemove={onRemove} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Statistics */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            <Gamepad2 size={14} />
            {gamesPlayed} game{gamesPlayed !== 1 ? 's' : ''}
          </Badge>

          <Badge variant="secondary">
            {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* User's Decks */}
        {filteredDecks.length > 0 && (
          <Collapsible open={decksExpanded} onOpenChange={setDecksExpanded}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 w-full p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                {decksExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="font-medium text-sm">Decks ({filteredDecks.length})</span>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="mt-2 flex flex-wrap gap-2">
                {filteredDecks.map(deck => (
                  <div key={deck.id} className="flex-shrink-0">
                    <Deck id={deck.id} useContextControls />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Button variant="primary" onClick={onCreateDeck}>
          Create New Deck
        </Button>
      </CardContent>
    </Card>
  )
}
