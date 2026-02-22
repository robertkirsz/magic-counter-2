import React from 'react'

const PlayerUserSelector: React.FC<{
  player: Player
  getUserName: (id: string) => string
  onShowUserSelect: () => void
}> = ({ player, getUserName, onShowUserSelect }) => (
  <button className="btn btn-primary btn-sm" onClick={onShowUserSelect}>
    {player.userId ? getUserName(player.userId) : 'User'}
  </button>
)

export default PlayerUserSelector
