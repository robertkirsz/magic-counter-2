import { Plus } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useUsers } from '../hooks/useUsers'
import { Button } from './Button'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
import { FadeMask } from './FadeMask'
import { ThreeDotMenu } from './ThreeDotMenu'
import { UserForm } from './UserForm'

export const Users: React.FC = () => {
  const { users, removeUser } = useUsers()
  const { decks } = useDecks()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string>()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const hasUsers = users.length > 0

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* Users List */}
      {hasUsers && (
        <FadeMask showMask={users.length > 3}>
          <div className="flex flex-col gap-2">
            {users.map((user, index) => {
              const filteredDecks = decks.filter(deck => deck.createdBy === user.id)
              const testId = `user-${index}`

              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-1 bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700"
                  data-testid={testId}
                >
                  <div className="flex gap-1 items-center">
                    <h3 className="line-clamp-1" data-testid={`${testId}-name`}>
                      {user.name}
                    </h3>

                    <ThreeDotMenu
                      testId={testId}
                      onEdit={() => setEditingId(user.id)}
                      onRemove={() => removeUser(user.id)}
                    />
                  </div>

                  {/* User's Decks */}
                  <div className="flex flex-col gap-2 empty:hidden">
                    {filteredDecks.map((deck, index) => (
                      <Deck key={deck.id} id={deck.id} testIndex={index} useContextControls />
                    ))}
                  </div>

                  <Button
                    data-testid={`${testId}-create-deck`}
                    variant="primary"
                    onClick={() => setSelectedUser(user.id)}
                  >
                    Create New Deck
                  </Button>
                </div>
              )
            })}
          </div>
        </FadeMask>
      )}

      {!hasUsers && (
        <p className="flex-1 flex justify-center items-center text-gray-500 italic">
          No users yet. Add your first user!
        </p>
      )}

      {/* Floating Add User Button */}
      <Button
        data-testid="users-add"
        variant="primary"
        round
        onClick={() => setIsAdding(true)}
        className="absolute bottom-3 right-3 shadow-lg z-10"
      >
        <Plus size={36} />
      </Button>

      {/* Create User Modal */}
      {(isAdding || editingId) && (
        <UserForm
          userId={editingId}
          onSave={() => {
            setEditingId(undefined)
            setIsAdding(false)
          }}
          onCancel={() => {
            setEditingId(undefined)
            setIsAdding(false)
          }}
        />
      )}

      {/* Add Deck Modal */}
      {selectedUser && (
        <DeckForm userId={selectedUser} onSave={() => setSelectedUser(null)} onCancel={() => setSelectedUser(null)} />
      )}
    </div>
  )
}
