import React from 'react'

import { Button } from '../Button'

const PlayerLifeControls: React.FC<{
  playerId: string
  displayLife: number
  pendingLifeChanges: number
  onLifeChange: (v: number) => void
}> = ({ playerId, displayLife, pendingLifeChanges, onLifeChange }) => (
  <div className="flex items-center gap-2">
    <Button
      data-testid={`${playerId}-remove-life`}
      className="text-4xl font-bold text-white"
      onClick={() => onLifeChange(-1)}
    >
      -
    </Button>

    <div className={`text-4xl font-bold ${pendingLifeChanges !== 0 ? 'text-blue-600' : ''}`}>
      <span data-testid={`${playerId}-life`} className="text-white">
        {displayLife}
      </span>

      {pendingLifeChanges !== 0 && (
        <span className="text-sm text-gray-500 ml-1">
          ({pendingLifeChanges > 0 ? '+' : ''}
          {pendingLifeChanges})
        </span>
      )}
    </div>

    <Button
      data-testid={`${playerId}-add-life`}
      className="text-4xl font-bold text-white"
      onClick={() => onLifeChange(1)}
    >
      +
    </Button>
  </div>
)

export default PlayerLifeControls
