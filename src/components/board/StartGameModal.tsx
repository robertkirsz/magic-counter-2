import React, { useEffect, useState } from 'react'

import { Button } from '../Button'
import { Modal } from '../Modal'

interface StartGameModalProps {
  isOpen: boolean
  validPlayers: { id: string }[]
  onChoosePlayer: (playerId: string) => void
  getPlayerName: (playerId: string) => string
}

const StartGameModal: React.FC<StartGameModalProps> = ({ isOpen, validPlayers, onChoosePlayer, getPlayerName }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

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
