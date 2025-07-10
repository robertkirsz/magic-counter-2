import React, { useState } from 'react'

import { useUsers } from '../contexts/UsersContext'

export const Users: React.FC = () => {
  const { users, addUser, removeUser, updateUser } = useUsers()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ name: '', decks: [] as string[] })
  const [editUser, setEditUser] = useState({ name: '', decks: [] as string[] })

  const handleAddUser = () => {
    if (newUser.name.trim()) {
      addUser({
        name: newUser.name,
        decks: newUser.decks
      })
      setNewUser({ name: '', decks: [] })
      setIsAdding(false)
    }
  }

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setEditUser({ name: user.name, decks: user.decks })
      setEditingId(userId)
    }
  }

  const handleSaveEdit = () => {
    if (editingId && editUser.name.trim()) {
      updateUser(editingId, { name: editUser.name, decks: editUser.decks })
      setEditingId(null)
      setEditUser({ name: '', decks: [] })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditUser({ name: '', decks: [] })
  }

  return (
    <div className="p-5 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-5">Users</h1>
      {/* Add User Section */}
      <div className="mb-5 p-4 border border-gray-200 rounded-lg">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Add New User
          </button>
        ) : (
          <div>
            <h3 className="mb-2 text-lg font-semibold">Add New User</h3>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Name:</label>
              <input
                type="text"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="User Name"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mr-2"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewUser({ name: '', decks: [] })
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
                {editingId === user.id ? (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Edit User</h3>
                    <div className="mb-2">
                      <label className="block mb-1 font-medium">Name:</label>
                      <input
                        type="text"
                        value={editUser.name}
                        onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
