import { Edit3, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useUsers } from '../hooks/useUsers'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
import { UserForm } from './UserForm'

export const Users: React.FC = () => {
  const { users, removeUser } = useUsers()
  const { decks, removeDeck } = useDecks()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string>()
  const [isAddingDeck, setIsAddingDeck] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [deckEditingId, setDeckEditingId] = useState<string | null>(null)

  return (
    <>
      <div className="flex flex-col gap-4 items-start">
        {/* Add User Section */}
        <button
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
            {users.map(user => {
              const filteredDecks = decks.filter(deck => deck.createdBy === user.id)

              return (
                <div key={user.id} className="flex flex-col gap-1 bg-white rounded-lg p-2 border border-gray-200">
                  <div className="flex gap-1 items-center">
                    <h3 className="line-clamp-1">{user.name}</h3>

                    <div className="flex gap-1 ml-auto">
                      <button
                        onClick={() => setEditingId(user.id)}
                        className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
                        title="Edit user"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => removeUser(user.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* User's Decks */}
                  {filteredDecks.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {filteredDecks.map(deck => (
                        <Deck key={deck.id} deck={deck} onEditDeck={setDeckEditingId} onRemoveDeck={removeDeck} />
                      ))}
                    </div>
                  )}

                  <button
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition self-end"
                    onClick={() => {
                      setSelectedUser(user.id)
                      setIsAddingDeck(true)
                    }}
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
        {isAddingDeck && (
          <DeckForm
            userId={selectedUser}
            onSave={() => {
              setIsAddingDeck(false)
              setSelectedUser(null)
            }}
            onCancel={() => {
              setIsAddingDeck(false)
              setSelectedUser(null)
            }}
          />
        )}

        {/* Edit Deck Modal */}
        {deckEditingId !== null && (
          <DeckForm
            userId={selectedUser}
            deckId={deckEditingId}
            onSave={() => setDeckEditingId(null)}
            onCancel={() => setDeckEditingId(null)}
          />
        )}
      </div>
    </>
  )
}
