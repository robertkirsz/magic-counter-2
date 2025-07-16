import React from 'react'

import { useUsers } from '../../hooks/useUsers'
import { Button } from '../Button'
import { Modal } from '../Modal'

const UserSelectionModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  game: Game
  onSelect: (userId: string) => void
  onCreateUser: () => void
}> = ({ isOpen, onClose, game, onSelect, onCreateUser }) => {
  const { users } = useUsers()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select User">
      <div className="flex flex-col gap-2">
        {users.length > 0 ? (
          <div className="flex flex-col gap-2">
            {users
              .filter(user => !game.players.some(p => p.userId === user.id))
              .map(user => (
                <Button
                  key={user.id}
                  onClick={() => onSelect(user.id)}
                  className="p-3 border border-gray-200 rounded-lg text-left"
                  variant="secondary"
                >
                  <div className="font-medium">{user.name}</div>
                </Button>
              ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No users available.</p>
        )}

        {users.filter(user => !game.players.some(p => p.userId === user.id)).length === 0 && users.length > 0 && (
          <p className="text-center text-gray-500">All users are already assigned to players.</p>
        )}

        <Button onClick={onCreateUser} className="px-3 py-1 text-sm" variant="primary">
          Create New User
        </Button>
      </div>
    </Modal>
  )
}

export default UserSelectionModal
