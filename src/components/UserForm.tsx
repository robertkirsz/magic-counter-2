import React, { useState } from 'react'

import { useUsers } from '../hooks/useUsers'
import { Modal } from './Modal'

interface UserFormProps {
  testId?: string
  userId?: User['id']
  onSave: (userId: string) => void
  onCancel: () => void
}

export const UserForm: React.FC<UserFormProps> = ({ testId = '', userId, onSave, onCancel }) => {
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
  const baseId = `user-form-${mode}`
  const testIdPrefix = testId ? `${testId}-${baseId}` : baseId

  return (
    <Modal isOpen testId={testIdPrefix} title={mode === 'create' ? 'Add User' : 'Edit User'} onClose={onCancel}>
      <div className="flex flex-col gap-4">
        {/* Name Input */}
        <input
          data-testid={`${testIdPrefix}-name`}
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
            data-testid={`${testIdPrefix}-save`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!name.trim()}
            onClick={handleSave}
          >
            {mode === 'create' ? 'Save User' : 'Save Changes'}
          </button>

          <button
            data-testid={`${testIdPrefix}-cancel`}
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
