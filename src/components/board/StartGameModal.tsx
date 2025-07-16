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
        <div className="flex flex-col gap-2">
          {validPlayers.map(player => (
            <Button
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
              className={`p-3 border rounded transition text-left ${
                selectedPlayerId === player.id
                  ? 'border-blue-600 bg-blue-50 font-bold text-blue-800'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {getPlayerName(player.id)}
              {selectedPlayerId === player.id && <span className="ml-2 text-blue-600">(Selected)</span>}
            </Button>
          ))}
        </div>
        <Button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={!selectedPlayerId}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  )
}

export default StartGameModal
