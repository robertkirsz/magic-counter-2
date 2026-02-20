import React, { useState } from 'react'

import { useUsers } from '../hooks/useUsers'

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
      <input autoFocus value={name} placeholder="Name" onChange={e => setName(e.target.value)} className="input input-bordered w-full" />

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <button className="btn btn-primary" disabled={!name.trim()}>
          {mode === 'create' ? 'Save User' : 'Save Changes'}
        </button>

        <button type="button" className="btn btn-error" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
