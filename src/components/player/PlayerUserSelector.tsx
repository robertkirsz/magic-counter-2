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
        <button onClick={onShowUserSelect}>
          <h1 className="text-lg font-bold">{getUserName(player.userId)}</h1>
        </button>
        <ThreeDotMenu onClose={onRemoveUser} asMenu={false} />
      </div>
    )}

    {!player.userId && (
      <button onClick={onShowUserSelect} className="bg-blue-500 text-white rounded-lg px-4 py-2">
        User
      </button>
    )}
  </>
)

export default PlayerUserSelector
