import { Edit3, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { useGames } from '../contexts/GamesContext'
import { useUsers } from '../contexts/UsersContext'
import { GameForm } from './GameForm'

export const Games: React.FC = () => {
  const { games, addGame, removeGame, updateGame } = useGames()
  const { users, addUser } = useUsers()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddGame = (data: { players: Player[]; tracking: Game['tracking'] }) => {
    addGame({
      players: data.players,
      activePlayer: null,
      tracking: data.tracking,
      state: 'active'
    })
    setIsAdding(false)
  }

  const handleEditGame = (gameId: string) => {
    setEditingId(gameId)
  }

  const handleSaveEdit = (data: { players: Player[]; tracking: Game['tracking'] }) => {
    if (editingId) {
      updateGame(editingId, { players: data.players, tracking: data.tracking })
      setEditingId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const getPlayerNames = (players: Player[]) => {
    return players.map(player => {
      const user = users.find(u => u.id === player.userId)
      return user ? user.name : 'Unknown'
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 items-start">
        {/* Add Game Section */}
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Game
        </button>

        {/* Games List */}
        <div>
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

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGame(game.id)}
                        className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                        title="Edit game"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => removeGame(game.id)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        title="Delete game"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Game Modal */}
      {isAdding && (
        <GameForm onSave={handleAddGame} onCancel={() => setIsAdding(false)} users={users} addUser={addUser} />
      )}

      {/* Edit Game Modal */}
      {editingId !== null && (
        <GameForm
          game={games.find(g => g.id === editingId)}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          users={users}
          addUser={addUser}
        />
      )}
    </>
  )
}
