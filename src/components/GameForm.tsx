import React, { useState } from 'react'

import { UserForm } from './UserForm'

interface GameFormProps {
  game?: Game
  onSave: (data: { players: Game['players']; tracking: Game['tracking'] }) => void
  onCancel: () => void
  users: Array<{ id: string; name: string }>
  addUser: (userData: { name: string; decks: string[] }) => {
    id: string
    name: string
    createdAt: Date
    decks: string[]
  }
}

export const GameForm: React.FC<GameFormProps> = ({ game, onSave, onCancel, users, addUser }) => {
  const mode = game ? 'edit' : 'create'
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(game?.players || [])
  const [tracking, setTracking] = useState<Game['tracking']>(game?.tracking || 'full')
  const [isAddingUser, setIsAddingUser] = useState(false)

  const handleAddNewUser = (userData: { name: string; decks: string[] }) => {
    const newUser = addUser(userData)
    setSelectedUserIds(prev => [...prev, newUser.id])
    setIsAddingUser(false)
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUserIds(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]))
  }

  const handleSave = () => {
    if (selectedUserIds.length > 0) onSave({ players: selectedUserIds, tracking })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-xl font-semibold">{mode === 'create' ? 'Add New Game' : 'Edit Game'}</h3>

        {/* User Selection */}
        {users.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">Select Existing Users:</label>
            <div className="grid grid-cols-2 gap-2 mb-3 max-h-32 overflow-y-auto">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{user.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Add New User */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Add New User:</label>
          <button
            onClick={() => setIsAddingUser(true)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add New User
          </button>
        </div>

        {/* Selected Players Summary */}
        {selectedUserIds.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="font-medium mb-1">Selected Players:</p>
            <p className="text-sm text-gray-600">
              {selectedUserIds
                .map(id => {
                  const user = users.find(u => u.id === id)
                  return user ? user.name : id
                })
                .join(', ')}
            </p>
          </div>
        )}

        {/* Tracking Selection */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Life Tracking:</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`tracking-${mode}`}
                value="full"
                checked={tracking === 'full'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="rounded"
              />
              <span className="text-sm">
                <strong>Full</strong> - Track all life changes and game events
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`tracking-${mode}`}
                value="simple"
                checked={tracking === 'simple'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="rounded"
              />
              <span className="text-sm">
                <strong>Simple</strong> - Track only current life totals (no turn tracking)
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`tracking-${mode}`}
                value="none"
                checked={tracking === 'none'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="rounded"
              />
              <span className="text-sm">
                <strong>None</strong> - Game will not be tracked
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            {mode === 'create' ? 'Save Game' : 'Save Changes'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddingUser && <UserForm mode="create" onSave={handleAddNewUser} onCancel={() => setIsAddingUser(false)} />}
    </div>
  )
}
