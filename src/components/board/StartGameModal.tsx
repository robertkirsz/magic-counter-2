import React, { useState } from 'react'

import { useGames } from '../../hooks/useGames'
import { useUsers } from '../../hooks/useUsers'
import { Button } from '../Button'

interface StartGameModalProps {
  gameId: string
  onChoosePlayer: (playerId: string) => void
}

const StartGameModal: React.FC<StartGameModalProps> = ({ gameId, onChoosePlayer }) => {
  const { games } = useGames()
  const { users } = useUsers()

  const game = games.find(g => g.id === gameId)
  const players = game?.players || []

  const randomIndex = Math.floor(Math.random() * players.length)
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[randomIndex].id)

  const getPlayerName = (playerId: string) => {
    if (!game) return 'Unknown'

    const player = game.players.find(p => p.id === playerId)

    if (!player?.userId) return 'Unknown'

    const user = users.find(u => u.id === player.userId)

    return user?.name || 'Unknown'
  }

  const handleConfirm = () => {
    onChoosePlayer(selectedPlayerId)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {players.map(player => (
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
  )
}

export default StartGameModal
