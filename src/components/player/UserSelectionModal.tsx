import React from 'react'

import { useUsers } from '../../hooks/useUsers'
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
                <button
                  key={user.id}
                  onClick={() => onSelect(user.id)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
                >
                  <div className="font-medium">{user.name}</div>
                </button>
              ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No users available.</p>
        )}

        {users.filter(user => !game.players.some(p => p.userId === user.id)).length === 0 && users.length > 0 && (
          <p className="text-center text-gray-500">All users are already assigned to players.</p>
        )}

        <button
          onClick={onCreateUser}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Create New User
        </button>
      </div>
    </Modal>
  )
}

export default UserSelectionModal
