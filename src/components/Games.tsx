import React, { useState } from 'react'

import { useGames } from '../contexts/GamesContext'
import { useUsers } from '../contexts/UsersContext'

export const Games: React.FC = () => {
  const { games, addGame, removeGame, updateGame } = useGames()
  const { users, addUser } = useUsers()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [newUserName, setNewUserName] = useState('')
  const [editGamePlayers, setEditGamePlayers] = useState('')
  const [editGameTracking, setEditGameTracking] = useState<'full' | 'simple' | 'none'>('full')
  const [tracking, setTracking] = useState<'full' | 'simple' | 'none'>('full')

  const handleAddGame = () => {
    if (selectedUserIds.length > 0) {
      addGame({ 
        players: selectedUserIds, 
        activePlayer: null,
        tracking: tracking
      })
      setSelectedUserIds([])
      setIsAdding(false)
      setTracking('full') // Reset to default
    }
  }

  const handleAddNewUser = () => {
    if (newUserName.trim()) {
      const newUser = addUser({ name: newUserName, decks: [] })
      setSelectedUserIds(prev => [...prev, newUser.id])
      setNewUserName('')
    }
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUserIds(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]))
  }

  const handleEditGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    if (game) {
      // Convert user IDs to names for editing
      const playerNames = game.players.map(playerId => {
        const user = users.find(u => u.id === playerId)
        return user ? user.name : playerId
      })
      setEditGamePlayers(playerNames.join(', '))
      setEditGameTracking(game.tracking)
      setEditingId(gameId)
    }
  }

  const handleSaveEdit = () => {
    if (editingId && editGamePlayers.trim()) {
      // Convert names back to IDs where possible
      const playerNames = editGamePlayers
        .split(',')
        .map(p => p.trim())
        .filter(p => p)
      
      const players = playerNames.map(name => {
        const user = users.find(u => u.name === name)
        return user ? user.id : name // Keep as name if no matching user found
      })
      
      setEditingId(null)
      setEditGamePlayers('')
      setEditGameTracking('full')
      updateGame(editingId, { players, tracking: editGameTracking })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditGamePlayers('')
    setEditGameTracking('full')
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
            <div className="mb-4">
              <label className="block mb-2 font-medium">Select Existing Users:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {users.map(user => (
                  <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{user.name}</span>
                  </label>
                ))}
              </div>
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
            {/* Selected Players Summary */}
            {selectedUserIds.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="font-medium mb-1">Selected Players:</p>
                <p className="text-sm text-gray-600">
                  {selectedUserIds
                    .map(id => {
                      const user = users.find(u => u.id === id)
                      return user ? user.name : id
                    })
                    .join(', ')}
                </p>
              </div>
            )}
            {/* Tracking Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Life Tracking:</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tracking"
                    value="full"
                    checked={tracking === 'full'}
                    onChange={(e) => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                    className="rounded"
                  />
                  <span className="text-sm">
                    <strong>Full</strong> - Track all life changes and game events
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tracking"
                    value="simple"
                    checked={tracking === 'simple'}
                    onChange={(e) => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                    className="rounded"
                  />
                  <span className="text-sm">
                    <strong>Simple</strong> - Track only current life totals
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tracking"
                    value="none"
                    checked={tracking === 'none'}
                    onChange={(e) => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                    className="rounded"
                  />
                  <span className="text-sm">
                    <strong>None</strong> - No life tracking
                  </span>
                </label>
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
                  setSelectedUserIds([])
                  setNewUserName('')
                  setTracking('full')
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
                    <div className="mb-2">
                      <label className="block mb-1 font-medium">Life Tracking:</label>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`tracking-${game.id}`}
                            value="full"
                            checked={editGameTracking === 'full'}
                            onChange={(e) => setEditGameTracking(e.target.value as 'full' | 'simple' | 'none')}
                            className="rounded"
                          />
                          <span className="text-sm">
                            <strong>Full</strong> - Track all life changes and game events
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`tracking-${game.id}`}
                            value="simple"
                            checked={editGameTracking === 'simple'}
                            onChange={(e) => setEditGameTracking(e.target.value as 'full' | 'simple' | 'none')}
                            className="rounded"
                          />
                          <span className="text-sm">
                            <strong>Simple</strong> - Track only current life totals
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`tracking-${game.id}`}
                            value="none"
                            checked={editGameTracking === 'none'}
                            onChange={(e) => setEditGameTracking(e.target.value as 'full' | 'simple' | 'none')}
                            className="rounded"
                          />
                          <span className="text-sm">
                            <strong>None</strong> - No life tracking
                          </span>
                        </label>
                      </div>
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
                      <p className="mb-1">
                        <span className="font-medium">Players:</span> {getPlayerNames(game.players).join(', ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Tracking:</span> {game.tracking.charAt(0).toUpperCase() + game.tracking.slice(1)}
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
