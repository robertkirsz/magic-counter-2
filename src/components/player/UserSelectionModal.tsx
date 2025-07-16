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
                <Button key={user.id} variant="secondary" onClick={() => onSelect(user.id)}>
                  {user.name}
                </Button>
              ))}
          </div>
        ) : (
          <p>No users available.</p>
        )}

        {users.filter(user => !game.players.some(p => p.userId === user.id)).length === 0 && users.length > 0 && (
          <p>All users are already assigned to players.</p>
        )}

        <Button variant="primary" onClick={onCreateUser}>
          Create New User
        </Button>
      </div>
    </Modal>
  )
}

export default UserSelectionModal
