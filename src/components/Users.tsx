import { Plus } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useUsers } from '../hooks/useUsers'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
import { ThreeDotMenu } from './ThreeDotMenu'
import { UserForm } from './UserForm'

export const Users: React.FC = () => {
  const { users, removeUser } = useUsers()
  const { decks } = useDecks()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string>()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  return (
    <>
      <div className="flex flex-col gap-4 items-start">
        {/* Add User Section */}
        <button
          data-testid="users-add"
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add New User
        </button>

        {/* Users List */}
        {users.length === 0 ? (
          <p className="text-gray-500 italic">No users yet. Add your first user!</p>
        ) : (
          <div className="flex flex-col gap-2 ">
            {/* TDOO: Create User component */}
            {users.map((user, index) => {
              const filteredDecks = decks.filter(deck => deck.createdBy === user.id)
              const testId = `user-${index}`

              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-1 bg-white rounded-lg p-2 border border-gray-200"
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

                  <button
                    data-testid={`${testId}-create-deck`}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition self-end"
                    onClick={() => setSelectedUser(user.id)}
                  >
                    Create New Deck
                  </button>
                </div>
              )
            })}
          </div>
        )}

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
    </>
  )
}
