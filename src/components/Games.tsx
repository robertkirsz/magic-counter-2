import React from 'react'

import { useGames } from '../hooks/useGames'
import { ThreeDotMenu } from './ThreeDotMenu'

export const Games: React.FC = () => {
  const { games, removeGame, groupActionsByRound } = useGames()

  return (
    <div className="flex flex-col gap-4 items-start">
      {/* Games List */}
      {games.length === 0 ? (
        <p className="text-gray-500 italic">No games yet. Add your first game!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {games.map(game => (
            <div
              key={game.id}
              className="flex flex-col gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
            >
              <h3 className="flex gap-1">
                <span className="font-semibold">{game.id.slice(0, 8)}...</span>
                <span className="text-gray-500">({game.createdAt.toLocaleDateString()})</span>
                <ThreeDotMenu onRemove={() => removeGame(game.id)} asMenu={false} className="ml-auto" />
              </h3>

              <div className="flex gap-1 flex-wrap">
                {game.players.map(player => (
                  <div key={player.id} className="flex flex-col gap-1 border border-gray-200 rounded-lg p-2">
                    <span>User: {player.userId}</span>
                    <span>Life: {player.life}</span>
                    <span>Deck: {player.deckId}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600">Turn tracking: {game.turnTracking ? 'Yes' : 'No'}</p>

              {/* Game Actions by Round */}
              {game.actions.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-semibold text-sm text-blue-600 hover:text-blue-700">
                    Game Actions ({game.actions.length})
                  </summary>
                  <div className="mt-2 text-xs max-h-40 overflow-y-auto">
                    {groupActionsByRound(game.id).map((roundGroup, roundIndex) => (
                      <div key={roundIndex} className="mb-3">
                        <div className="font-semibold text-blue-600 mb-1">Round {roundGroup.round}</div>
                        {roundGroup.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="ml-2 mb-1 text-gray-600">
                            {action.type === 'life-change' ? (
                              <span>
                                Life change: {action.value} from {action.from} to {action.to?.join(', ')}
                              </span>
                            ) : (
                              <span>
                                Turn change: {action.from} → {action.to}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
