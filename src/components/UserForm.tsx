import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { useUsers } from '../hooks/useUsers'
import { Button } from './Button'

interface UserFormProps {
  userId?: User['id']
  onSave: (userId: string) => void
  onCancel: () => void
}

export const UserForm: React.FC<UserFormProps> = ({ userId, onSave, onCancel }) => {
  const mode = userId ? 'edit' : 'create'

  const { addUser, updateUser, users } = useUsers()

  const user = users.find(u => u.id === userId)

  const [name, setName] = useState(user?.name || '')

  const resetForm = () => {
    setName('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedName = name.trim()

    if (trimmedName) {
      if (userId) {
        updateUser(userId, { name: trimmedName })
        onSave(userId)
        resetForm()
      } else {
        onSave(addUser({ name: trimmedName }).id)
        resetForm()
      }
    }
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Name Input */}
      <Input autoFocus value={name} placeholder="Name" onChange={e => setName(e.target.value)} />

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="primary" disabled={!name.trim()}>
          {mode === 'create' ? 'Save User' : 'Save Changes'}
        </Button>

        <Button type="button" variant="danger" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
