import React from 'react'

import { Modal } from './Modal'
import PlayerLifeControls from './player/PlayerLifeControls'

interface AttackModalProps {
  isOpen: boolean
  onClose: () => void
  attackerId: string
  targetId: string
  gameId: string
  currentLife: number
}

export const AttackModal: React.FC<AttackModalProps> = ({
  isOpen,
  onClose,
  attackerId,
  targetId,
  gameId,
  currentLife
}) => {
  return (
    <Modal isOpen={isOpen} title="Attack Player" onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Attack with sword</p>
          <p className="text-sm text-gray-600">Remove life from the target player</p>
        </div>

        <div className="w-full">
          <PlayerLifeControls
            playerId={targetId}
            gameId={gameId}
            currentLife={currentLife}
            onLifeCommitted={onClose}
            attackMode
            attackerId={attackerId}
          />
        </div>
      </div>
    </Modal>
  )
}
