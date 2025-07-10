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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Games</h1>

      {/* Add Game Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Add New Game
          </button>
        ) : (
          <div>
            <h3 style={{ marginBottom: '10px' }}>Add New Game</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Players (comma-separated):</label>
              <input
                type="text"
                value={newGamePlayers}
                onChange={e => setNewGamePlayers(e.target.value)}
                placeholder="Player 1, Player 2, Player 3"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '3px'
                }}
              />
            </div>
            <div>
              <button
                onClick={handleAddGame}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewGamePlayers('')
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Games List */}
      <div>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Current Games</h2>
        {games.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No games yet. Add your first game!</p>
        ) : (
          <div>
            {games.map(game => (
              <div
                key={game.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                {editingId === game.id ? (
                  <div>
                    <h3 style={{ marginBottom: '10px' }}>Edit Game</h3>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Players (comma-separated):</label>
                      <input
                        type="text"
                        value={editGamePlayers}
                        onChange={e => setEditGamePlayers(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '10px'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>Game {game.id.slice(0, 8)}</h3>
                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                          Created: {game.createdAt.toLocaleDateString()}
                        </p>
                        <p style={{ margin: '0' }}>
                          <strong>Players:</strong> {game.players.join(', ')}
                        </p>
                      </div>
                      <div>
                        <button
                          onClick={() => handleEditGame(game.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            marginRight: '10px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeGame(game.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
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
