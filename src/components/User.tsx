import React from 'react'

import { useDecks } from '../hooks/useDecks'
import { Button } from './Button'
import { Deck } from './Deck'
import { ThreeDotMenu } from './ThreeDotMenu'

interface UserProps {
  user: User
  testIndex: number
  onEdit: () => void
  onRemove: () => void
  onCreateDeck: () => void
}

export const User: React.FC<UserProps> = ({ user, testIndex, onEdit, onRemove, onCreateDeck }) => {
  const { decks } = useDecks()
  const testId = `user-${testIndex}`

  const filteredDecks = decks.filter(deck => deck.createdBy === user.id)

  return (
    <div
      className="flex flex-col gap-1 bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700"
      data-testid={testId}
    >
      <div className="flex gap-1 items-center">
        <h3 className="text-gray-900 dark:text-white  line-clamp-1" data-testid={`${testId}-name`}>
          {user.name}
        </h3>

        <ThreeDotMenu testId={testId} onEdit={onEdit} onRemove={onRemove} />
      </div>

      {/* User's Decks */}
      <div className="flex flex-col gap-2 empty:hidden">
        {filteredDecks.map((deck, index) => (
          <Deck key={deck.id} id={deck.id} testIndex={index} useContextControls />
        ))}
      </div>

      <Button data-testid={`${testId}-create-deck`} variant="primary" onClick={onCreateDeck}>
        Create New Deck
      </Button>
    </div>
  )
}
