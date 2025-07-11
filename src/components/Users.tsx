import { Edit3, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { useUsers } from '../contexts/UsersContext'
import { Deck } from './Deck'
import { UserForm } from './UserForm'

export const Users: React.FC = () => {
  const { users, addUser, removeUser, updateUser } = useUsers()
  const { decks } = useDecks()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

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
        <div>
          {users.length === 0 ? (
            <p className="text-gray-500 italic">No users yet. Add your first user!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map(user => {
                const filteredDecks = decks.filter(deck => deck.createdBy === user.id)

                return (
                  <div key={user.id} className="rounded border border-gray-200 flex flex-col items-start gap-1 p-2">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs text-gray-500">User</span>

                      <div className="flex gap-1">
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

                    <h3>{user.name}</h3>

                    {/* User's Decks */}
                    <div className="flex flex-col gap-2">
                      {filteredDecks.length === 0 ? (
                        <p className="text-gray-500 italic">No decks yet. Add your first deck!</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {filteredDecks.map(deck => (
                            <Deck
                              key={deck.id}
                              deck={deck}
                              showActions={false}
                              showCreator={false}
                              className="border border-gray-200"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {isAdding && <UserForm mode="create" onSave={handleAddUser} onCancel={() => setIsAdding(false)} />}

        {/* Edit User Modal */}
        {editingId !== null && (
          <UserForm
            mode="edit"
            user={users.find(u => u.id === editingId)}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </>
  )
}
