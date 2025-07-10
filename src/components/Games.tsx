import React, { useState } from 'react'

import { useGames } from '../contexts/GamesContext'
import { useUsers } from '../contexts/UsersContext'

export const Games: React.FC = () => {
  const { games, addGame, removeGame, updateGame } = useGames()
  const { users, addUser } = useUsers()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newGamePlayers, setNewGamePlayers] = useState('')
  const [editGamePlayers, setEditGamePlayers] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [newUserName, setNewUserName] = useState('')

  const handleAddGame = () => {
    if (newGamePlayers.trim() || selectedUsers.length > 0) {
      let players: string[] = []

      // Add selected users
      players = [...selectedUsers]

      // Add manually entered players
      if (newGamePlayers.trim()) {
        players = [...players, ...newGamePlayers
          .split(',')
          .map(p => p.trim())
          .filter(p => p)]
      }

      if (players.length > 0) {
        addGame({ players })
        setNewGamePlayers('')
        setSelectedUsers([])
        setIsAdding(false)
      }
    }
  }

  const handleAddNewUser = () => {
    if (newUserName.trim()) {
      addUser({ name: newUserName, decks: [] })
      setSelectedUsers(prev => [...prev, newUserName])
      setNewUserName('')
    }
  }

  const handleUserSelect = (userName: string) => {
    setSelectedUsers(prev => (prev.includes(userName) ? prev.filter(name => name !== userName) : [...prev, userName]))
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
      setEditingId(null)
      setEditGamePlayers('')
      updateGame(editingId, {
        players: editGamePlayers
          .split(',')
          .map(p => p.trim())
          .filter(p => p)
      })
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

            {/* User Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.name)}
                    onChange={() => handleUserSelect(user.name)}
                    className="rounded"
                  />
                  <span className="text-sm">{user.name}</span>
                </label>
              ))}
            </div>

            {/* Add New User */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Add New User:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="New user name"
                  className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button
                  onClick={handleAddNewUser}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Add User
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={handleAddGame}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mr-2"
              >
                Save Game
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewGamePlayers('')
                  setSelectedUsers([])
                  setNewUserName('')
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
              <div key={game.id} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
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
                      <p>
                        <span className="font-medium">Players:</span> {game.players.join(', ')}
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
