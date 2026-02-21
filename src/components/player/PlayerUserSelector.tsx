import React from 'react'

import { ThreeDotMenu } from '../ThreeDotMenu'

const PlayerUserSelector: React.FC<{
  player: Player
  getUserName: (id: string) => string
  onShowUserSelect: () => void
  onRemoveUser: () => void
}> = ({ player, getUserName, onShowUserSelect, onRemoveUser }) => (
  <>
    {player.userId && (
      <div className="flex items-center gap-1">
        <button className="btn btn-primary" onClick={onShowUserSelect}>
          {getUserName(player.userId)}
        </button>

        <ThreeDotMenu onClose={onRemoveUser} asMenu={false} />
      </div>
    )}

    {!player.userId && (
      <button className="btn btn-primary" onClick={onShowUserSelect}>
        User
      </button>
    )}
  </>
)

export default PlayerUserSelector
