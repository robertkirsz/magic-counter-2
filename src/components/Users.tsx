import { UsersIcon } from 'lucide-react'
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
    <div className="flex flex-col gap-4 overflow-hidden">
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
        <div className="flex flex-col items-center justify-center text-center">
          <UsersIcon size={48} className="text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No users yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Add someone to play with!</p>
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={!!editingId} title="Edit User" onClose={() => setEditingId(undefined)}>
        <UserForm userId={editingId} onSave={() => setEditingId(undefined)} onCancel={() => setEditingId(undefined)} />
      </Modal>

      {/* Add Deck Modal */}
      <Modal isOpen={!!selectedUser} title="Add Deck" onClose={() => setSelectedUser(null)}>
        <DeckForm userId={selectedUser} onSave={() => setSelectedUser(null)} onCancel={() => setSelectedUser(null)} />
      </Modal>
    </div>
  )
}
