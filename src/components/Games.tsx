import { Trash2 } from 'lucide-react'
import React from 'react'

import { useGames } from '../contexts/GamesContext'

export const Games: React.FC = () => {
  const { games, removeGame } = useGames()

  return (
    <div className="flex flex-col gap-4 items-start">
      {/* Games List */}
      {games.length === 0 ? (
        <p className="text-gray-500 italic">No games yet. Add your first game!</p>
      ) : (
        <div>
          {games.map(game => (
            <div key={game.id} className="flex flex-col gap-2 border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
              <h3 className="font-semibold flex gap-1">
                Game {game.id.slice(0, 8)}...
                <span className="text-gray-500">({game.createdAt.toLocaleDateString()})</span>
              </h3>

              <div className="mb-1 flex gap-1">
                {game.players.map(player => (
                  <div key={player.id} className="flex flex-col gap-1 border border-gray-200 rounded-lg p-2">
                    <span>ID: {player.id}</span>
                    <span>User: {player.userId}</span>
                    <span>Life: {player.life}</span>
                    <span>Deck: {player.deck}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600">
                <span className="font-medium">Tracking:</span>{' '}
                {game.tracking.charAt(0).toUpperCase() + game.tracking.slice(1)}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => removeGame(game.id)}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  title="Delete game"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
