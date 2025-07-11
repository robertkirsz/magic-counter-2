import { Edit3, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { useUsers } from '../contexts/UsersContext'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
import { UserForm } from './UserForm'

export const Users: React.FC = () => {
  const { users, addUser, removeUser, updateUser } = useUsers()
  const { decks, addDeck, removeDeck, updateDeck } = useDecks()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddingDeck, setIsAddingDeck] = useState(false)
  const [selectedPlayerForDeck, setSelectedPlayerForDeck] = useState<string | null>(null)
  const [deckEditingId, setDeckEditingId] = useState<string | null>(null)

  const handleAddUser = (data: { name: string }) => {
    addUser({ name: data.name })
    setIsAdding(false)
  }

  const handleEditUser = (userId: string) => {
    setEditingId(userId)
  }

  const handleSaveEdit = (data: { name: string }) => {
    if (editingId) {
      updateUser(editingId, { name: data.name })
      setEditingId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleCreateDeck = (deckData: { name: string; colors: ManaColor[]; commanders?: ScryfallCard[] }) => {
    if (selectedPlayerForDeck) {
      addDeck({ ...deckData, createdBy: selectedPlayerForDeck })
      setIsAddingDeck(false)
      setSelectedPlayerForDeck(null)
    }
  }

  const handleSaveDeckEdit = (data: { name: string; colors: ManaColor[]; commanders?: ScryfallCard[] }) => {
    if (deckEditingId) {
      updateDeck(deckEditingId, { ...data })
      setDeckEditingId(null)
    }
  }

  const handleCancelDeckEdit = () => {
    setDeckEditingId(null)
  }

  return (
    <>
      <div className="flex flex-col gap-4 items-start">
        <h1 className="text-3xl font-bold text-gray-800">Users</h1>

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
                        onClick={() => handleEditUser(user.id)}
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
                      setSelectedPlayerForDeck(user.id)
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
        {isAdding && <UserForm onSave={handleAddUser} onCancel={() => setIsAdding(false)} />}

        {/* Edit User Modal */}
        {editingId !== null && (
          <UserForm user={users.find(u => u.id === editingId)} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
        )}

        {/* Add Deck Modal */}
        {isAddingDeck && (
          <DeckForm
            onSave={handleCreateDeck}
            onCancel={() => {
              setIsAddingDeck(false)
              setSelectedPlayerForDeck(null)
            }}
          />
        )}

        {/* Edit Deck Modal */}
        {deckEditingId !== null && (
          <DeckForm
            deck={decks.find(d => d.id === deckEditingId)}
            onSave={handleSaveDeckEdit}
            onCancel={handleCancelDeckEdit}
          />
        )}
      </div>
    </>
  )
}
