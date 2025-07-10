import React, { useState } from 'react'
import { useGames } from '../contexts/GamesContext'

export const Games: React.FC = () => {
  const { games, addGame, removeGame, updateGame } = useGames()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newGamePlayers, setNewGamePlayers] = useState('')
  const [editGamePlayers, setEditGamePlayers] = useState('')

  const handleAddGame = () => {
    if (newGamePlayers.trim()) {
      const players = newGamePlayers
        .split(',')
        .map(p => p.trim())
        .filter(p => p)
      addGame({ players })
      setNewGamePlayers('')
      setIsAdding(false)
    }
  }

  const handleEditGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    if (game) {
      setEditGamePlayers(game.players.join(', '))
      setEditingId(gameId)
    }
  }

  const handleSaveEdit = () => {
    if (editingId && editGamePlayers.trim()) {
      const players = editGamePlayers
        .split(',')
        .map(p => p.trim())
        .filter(p => p)
      updateGame(editingId, { players })
      setEditingId(null)
      setEditGamePlayers('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditGamePlayers('')
  }

  return (
    <div className="p-5 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-5">Games</h1>
      {/* Add Game Section */}
      <div className="mb-5 p-4 border border-gray-200 rounded-lg">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Add New Game
          </button>
        ) : (
          <div>
            <h3 className="mb-2 text-lg font-semibold">Add New Game</h3>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Players (comma-separated):</label>
              <input
                type="text"
                value={newGamePlayers}
                onChange={e => setNewGamePlayers(e.target.value)}
                placeholder="Player 1, Player 2, Player 3"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <button
                onClick={handleAddGame}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mr-2"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewGamePlayers('')
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Games List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Games</h2>
        {games.length === 0 ? (
          <p className="text-gray-500 italic">No games yet. Add your first game!</p>
        ) : (
          <div>
            {games.map(game => (
              <div
                key={game.id}
                className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50"
              >
                {editingId === game.id ? (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Edit Game</h3>
                    <div className="mb-2">
                      <label className="block mb-1 font-medium">Players (comma-separated):</label>
                      <input
                        type="text"
                        value={editGamePlayers}
                        onChange={e => setEditGamePlayers(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold mb-1">Game {game.id.slice(0, 8)}</h3>
                      <p className="text-gray-500 mb-1">Created: {game.createdAt.toLocaleDateString()}</p>
                      <p><span className="font-medium">Players:</span> {game.players.join(', ')}</p>
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
