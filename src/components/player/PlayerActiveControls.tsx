import React from 'react'

const PlayerActiveControls: React.FC<{
  game: Game
  playerIsActive: boolean
  onClearActive: () => void
  onPassTurn: () => void
  onGainPriority: () => void
}> = ({ game, playerIsActive, onClearActive, onPassTurn, onGainPriority }) => (
  <div className="flex gap-1">
    {playerIsActive && (
      <button
        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-xs mb-1"
        onClick={onClearActive}
      >
        Clear
      </button>
    )}

    {playerIsActive && game.turnTracking && (
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs mb-1"
        onClick={onPassTurn}
      >
        Pass
      </button>
    )}

    {game.turnTracking && !playerIsActive && (
      <button
        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs mb-1"
        onClick={onGainPriority}
      >
        Gain
      </button>
    )}
  </div>
)

export default PlayerActiveControls
