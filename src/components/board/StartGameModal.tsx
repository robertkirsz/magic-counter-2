import React, { useEffect, useState } from 'react'

import { useGames } from '../../hooks/useGames'
import { useUsers } from '../../hooks/useUsers'
import { Button } from '../Button'
import { Modal } from '../Modal'

interface StartGameModalProps {
  isOpen: boolean
  validPlayers: { id: string }[]
  onChoosePlayer: (playerId: string) => void
}

const StartGameModal: React.FC<StartGameModalProps> = ({ isOpen, validPlayers, onChoosePlayer }) => {
  const { games } = useGames()
  const { users } = useUsers()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const getPlayerName = (playerId: string) => {
    const game = games.find(g => g.players.some(p => p.id === playerId))
    if (!game) return 'Unknown'

    const player = game.players.find(p => p.id === playerId)
    if (!player?.userId) return 'Unknown'

    const user = users.find(u => u.id === player.userId)
    return user?.name || 'Unknown'
  }

  useEffect(() => {
    if (isOpen && validPlayers.length > 0) {
      // Pick a random player when modal opens
      const randomIndex = Math.floor(Math.random() * validPlayers.length)
      setSelectedPlayerId(validPlayers[randomIndex].id)
    }
  }, [isOpen, validPlayers])

  const handleConfirm = () => {
    if (selectedPlayerId) {
      onChoosePlayer(selectedPlayerId)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleConfirm} title="Who starts?" hideCloseButton>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          {validPlayers.map(player => (
            <Button
              key={player.id}
              variant={selectedPlayerId === player.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedPlayerId(player.id)}
            >
              {getPlayerName(player.id)}
            </Button>
          ))}
        </div>

        <Button variant="primary" disabled={!selectedPlayerId} onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}

export default StartGameModal
