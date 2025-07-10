import React, { useState } from 'react'

interface UserFormProps {
  mode: 'create' | 'edit'
  user?: User
  onSave: (data: { name: string; decks: string[] }) => void
  onCancel: () => void
}

export const UserForm: React.FC<UserFormProps> = ({ mode, user, onSave, onCancel }) => {
  const [name, setName] = useState(user?.name || '')
  const [decks, setDecks] = useState<string[]>(user?.decks || [])

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), decks })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="mb-4 text-xl font-semibold">{mode === 'create' ? 'Add New User' : 'Edit User'}</h3>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Name:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="User Name"
            className="w-full p-2 border border-gray-300 rounded"
            autoFocus
          />
        </div>

        {/* Decks Display (Read-only for now) */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Decks:</label>
          <div className="p-3 bg-gray-50 rounded border">
            {decks.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No decks assigned</p>
            ) : (
              <div className="space-y-1">
                {decks.map((deckId, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    Deck {index + 1} (ID: {deckId})
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Deck management will be available in a future update</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            {mode === 'create' ? 'Save User' : 'Save Changes'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
