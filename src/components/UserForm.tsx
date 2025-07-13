import React, { useState } from 'react'

import { useUsers } from '../hooks/useUsers'
import { Modal } from './Modal'

interface UserFormProps {
  userId?: User['id']
  onSave: (userId: string) => void
  onCancel: () => void
}

export const UserForm: React.FC<UserFormProps> = ({ userId, onSave, onCancel }) => {
  const { addUser, updateUser, users } = useUsers()
  const user = users.find(u => u.id === userId)

  const [name, setName] = useState(user?.name || '')

  const handleSave = () => {
    if (name.trim()) {
      if (userId) {
        updateUser(userId, { name: name.trim() })
        onSave(userId)
      } else {
        const newUser = addUser({ name: name.trim() })
        onSave(newUser.id)
      }
    }
  }

  const mode = userId ? 'edit' : 'create'

  return (
    <Modal isOpen={true} onClose={onCancel} title={mode === 'create' ? 'Add New User' : 'Edit User'}>
      <div className="flex flex-col gap-4">
        {/* Name Input */}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="w-full p-2 border border-gray-300 rounded"
          autoFocus
        />

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!name.trim()}
            onClick={handleSave}
          >
            {mode === 'create' ? 'Save User' : 'Save Changes'}
          </button>

          <button onClick={onCancel} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
