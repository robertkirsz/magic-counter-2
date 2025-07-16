import React from 'react'

import { Button } from '../Button'
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
        <Button onClick={onShowUserSelect}>
          <h1 className="text-lg font-bold">{getUserName(player.userId)}</h1>
        </Button>
        <ThreeDotMenu onClose={onRemoveUser} asMenu={false} />
      </div>
    )}

    {!player.userId && (
      <Button onClick={onShowUserSelect} className="bg-blue-500 text-white rounded-lg px-4 py-2">
        User
      </Button>
    )}
  </>
)

export default PlayerUserSelector
