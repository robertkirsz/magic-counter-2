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
        <Button variant="primary" onClick={onShowUserSelect}>
          {getUserName(player.userId)}
        </Button>

        <ThreeDotMenu onClose={onRemoveUser} asMenu={false} />
      </div>
    )}

    {!player.userId && (
      <Button variant="primary" onClick={onShowUserSelect}>
        User
      </Button>
    )}
  </>
)

export default PlayerUserSelector
