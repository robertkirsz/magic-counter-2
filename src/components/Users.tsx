import React, { useState } from 'react'

import { useUsers } from '../hooks/useUsers'
import { DeckForm } from './DeckForm'
import { FadeMask } from './FadeMask'
import { Modal } from './Modal'
import { User } from './User'
import { UserForm } from './UserForm'

export const Users: React.FC = () => {
  const { users, removeUser } = useUsers()

  const [editingId, setEditingId] = useState<string>()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const hasUsers = users.length > 0

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* Users List */}
      {hasUsers && (
        <FadeMask showMask={users.length > 3}>
          <div className="flex flex-col gap-2">
            {users.map((user, index) => (
              <User
                key={user.id}
                user={user}
                testIndex={index}
                onEdit={() => setEditingId(user.id)}
                onRemove={() => removeUser(user.id)}
                onCreateDeck={() => setSelectedUser(user.id)}
              />
            ))}
          </div>
        </FadeMask>
      )}

      {!hasUsers && (
        <p className="flex-1 flex justify-center items-center text-gray-500 italic">
          No users yet. Add your first user!
        </p>
      )}

      {/* Create User Modal */}
      {editingId && (
        <Modal isOpen={!!editingId} title="Edit User" onClose={() => setEditingId(undefined)}>
          <UserForm
            userId={editingId}
            onSave={() => setEditingId(undefined)}
            onCancel={() => setEditingId(undefined)}
          />
        </Modal>
      )}

      {/* Add Deck Modal */}
      {selectedUser && (
        <DeckForm userId={selectedUser} onSave={() => setSelectedUser(null)} onCancel={() => setSelectedUser(null)} />
      )}
    </div>
  )
}
