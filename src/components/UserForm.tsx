import React, { useState } from 'react'

import { useUsers } from '../hooks/useUsers'
import { Button } from './Button'

interface UserFormProps {
  testId?: string
  userId?: User['id']
  onSave: (userId: string) => void
  onCancel: () => void
}

export const UserForm: React.FC<UserFormProps> = ({ testId = '', userId, onSave, onCancel }) => {
  const mode = userId ? 'edit' : 'create'
  const baseId = `user-form-${mode}`
  const testIdPrefix = testId ? `${testId}-${baseId}` : baseId

  const { addUser, updateUser, users } = useUsers()

  const user = users.find(u => u.id === userId)

  const [name, setName] = useState(user?.name || '')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedName = name.trim()

    if (trimmedName) {
      if (userId) {
        updateUser(userId, { name: trimmedName })
        onSave(userId)
      } else {
        onSave(addUser({ name: trimmedName }).id)
      }
    }
  }

  return (
    <form data-testid={baseId} className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Name Input */}
      <input
        data-testid={`${testIdPrefix}-name`}
        autoFocus
        value={name}
        placeholder="Name"
        onChange={e => setName(e.target.value)}
        className="form-input"
      />

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button data-testid={`${testIdPrefix}-save`} variant="primary" disabled={!name.trim()}>
          {mode === 'create' ? 'Save User' : 'Save Changes'}
        </Button>

        <Button type="button" data-testid={`${testIdPrefix}-cancel`} variant="danger" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
