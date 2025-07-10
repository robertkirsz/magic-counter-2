import React, { useState } from 'react'

import { useUsers } from '../contexts/UsersContext'
import { UserForm } from './UserForm'

export const Users: React.FC = () => {
  const { users, addUser, removeUser, updateUser } = useUsers()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddUser = (data: { name: string; decks: string[] }) => {
    addUser({
      name: data.name,
      decks: data.decks
    })
    setIsAdding(false)
  }

  const handleEditUser = (userId: string) => {
    setEditingId(userId)
  }

  const handleSaveEdit = (data: { name: string; decks: string[] }) => {
    if (editingId) {
      updateUser(editingId, { name: data.name, decks: data.decks })
      setEditingId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  return (
    <div className="p-5 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-5">Users</h1>

      {/* Add User Section */}
      <div className="mb-5 p-4 border border-gray-200 rounded-lg">
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Add New User
        </button>
      </div>

      {/* Users List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500 italic">No users yet. Add your first user!</p>
        ) : (
          <div>
            {users.map(user => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold mb-1">{user.name}</h3>
                    <p className="text-gray-500 mb-1">Created: {user.createdAt.toLocaleDateString()}</p>
                    <p>
                      <span className="font-medium">Decks:</span> {user.decks.length}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeUser(user.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
  )
}
