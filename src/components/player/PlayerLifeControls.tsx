import React from 'react'

const PlayerLifeControls: React.FC<{
  playerId: string
  displayLife: number
  pendingLifeChanges: number
  onLifeChange: (v: number) => void
}> = ({ playerId, displayLife, pendingLifeChanges, onLifeChange }) => (
  <div className="flex items-center gap-2">
    <button
      data-testid={`${playerId}-remove-life`}
      onClick={() => onLifeChange(-1)}
      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      -
    </button>

    <div className={`text-xl font-bold ${pendingLifeChanges !== 0 ? 'text-blue-600' : ''}`}>
      <span data-testid={`${playerId}-life`}>{displayLife}</span>
      {pendingLifeChanges !== 0 && (
        <span className="text-sm text-gray-500 ml-1">
          ({pendingLifeChanges > 0 ? '+' : ''}
          {pendingLifeChanges})
        </span>
      )}
    </div>

    <button
      data-testid={`${playerId}-add-life`}
      onClick={() => onLifeChange(1)}
      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
    >
      +
    </button>
  </div>
)

export default PlayerLifeControls
