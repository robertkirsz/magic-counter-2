import React, { useState } from 'react'

import { useGames } from '../contexts/GamesContext'
import { useUsers } from '../contexts/UsersContext'
import { GameForm } from './GameForm'

export const Games: React.FC = () => {
  const { games, addGame, removeGame, updateGame } = useGames()
  const { users, addUser } = useUsers()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddGame = (data: { players: string[]; tracking: 'full' | 'simple' | 'none' }) => {
    addGame({
      players: data.players,
      activePlayer: null,
      tracking: data.tracking
    })
    setIsAdding(false)
  }

  const handleEditGame = (gameId: string) => {
    setEditingId(gameId)
  }

  const handleSaveEdit = (data: { players: string[]; tracking: 'full' | 'simple' | 'none' }) => {
    if (editingId) {
      // Convert names back to IDs where possible
      const playerNames = data.players.map(p => p.trim()).filter(p => p)

      const players = playerNames.map(name => {
        const user = users.find(u => u.name === name)
        return user ? user.id : name // Keep as name if no matching user found
      })

      setEditingId(null)
      updateGame(editingId, { players, tracking: data.tracking })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const getPlayerNames = (playerIds: string[]) => {
    return playerIds.map(id => {
      const user = users.find(u => u.id === id)
      return user ? user.name : 'Unknown'
    })
  }

  return (
    <div className="p-5 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-5">Games</h1>

      {/* Add Game Section */}
      <div className="mb-5 p-4 border border-gray-200 rounded-lg">
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Add New Game
        </button>
      </div>

      {/* Games List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Games</h2>
        {games.length === 0 ? (
          <p className="text-gray-500 italic">No games yet. Add your first game!</p>
        ) : (
          <div>
            {games.map(game => (
              <div key={game.id} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold mb-1">Game {game.id.slice(0, 8)}</h3>
                    <p className="text-gray-500 mb-1">Created: {game.createdAt.toLocaleDateString()}</p>
                    <p className="mb-1">
                      <span className="font-medium">Players:</span> {getPlayerNames(game.players).join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tracking:</span>{' '}
                      {game.tracking.charAt(0).toUpperCase() + game.tracking.slice(1)}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleEditGame(game.id)}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeGame(game.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Game Modal */}
      {isAdding && (
        <GameForm
          mode="create"
          onSave={handleAddGame}
          onCancel={() => setIsAdding(false)}
          users={users}
          addUser={addUser}
        />
      )}

      {/* Edit Game Modal */}
      {editingId !== null && (
        <GameForm
          mode="edit"
          game={games.find(g => g.id === editingId)}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          users={users}
          addUser={addUser}
        />
      )}
    </div>
  )
}
