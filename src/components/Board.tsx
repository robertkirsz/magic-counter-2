import { Play, Settings } from 'lucide-react'
import React, { useState } from 'react'

import { useGames } from '../contexts/GamesContext'
import { useUsers } from '../contexts/UsersContext'
import { GameForm } from './GameForm'
import { Modal } from './Modal'

interface BoardProps {
  game: Game
}

export const Board: React.FC<BoardProps> = ({ game }) => {
  const { updateGame } = useGames()
  const { users } = useUsers()

  const [showSettings, setShowSettings] = useState(false)
  const [showUserSelect, setShowUserSelect] = useState<string | null>(null)

  const handlePlay = () => {
    updateGame(game.id, { state: 'active' })
  }

  const handleUserSelect = (playerId: string, userId: string | null) => {
    updateGame(game.id, {
      players: game.players.map(player => (player.id === playerId ? { ...player, userId } : player))
    })
    setShowUserSelect(null)
  }

  const handleGameSettingsSave = (data: { players: Player[]; tracking: Game['tracking'] }) => {
    updateGame(game.id, {
      players: data.players,
      tracking: data.tracking
    })
    setShowSettings(false)
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unknown User'
  }

  const validPlayers = game.players.filter(player => player.userId && player.deck)
  const canPlay = validPlayers.length >= 2

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50">
      {/* Player Sections */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2">
        {game.players.map(player => (
          <div key={player.id} className="flex flex-col gap-1 border border-gray-200 rounded-lg p-2">
            <span>{player.id}</span>
            <span>{player.userId ? getUserName(player.userId) : 'No user assigned'}</span>
            <span>Life: {player.life}</span>
            <span>Deck: {player.deck}</span>

            {!player.userId && (
              <button
                onClick={() => setShowUserSelect(player.id)}
                className="bg-blue-500 text-white rounded-lg p-2 w-full"
              >
                Select User
              </button>
            )}

            {player.userId && (
              <button
                onClick={() => handleUserSelect(player.id, null)}
                className="bg-red-500 text-white rounded-lg p-2 w-full"
              >
                Remove User
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Settings Overlay */}
      <div className="fixed top-2 right-2">
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Play Button */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 flex justify-center w-full">
        <button
          disabled={!canPlay}
          onClick={handlePlay}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={32} />
          <span className="text-lg font-bold">PLAY</span>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Game Settings">
          <GameForm game={game} onSave={handleGameSettingsSave} onCancel={() => setShowSettings(false)} />
        </Modal>
      )}

      {/* User Selection Modal */}
      {showUserSelect && (
        <Modal isOpen={!!showUserSelect} onClose={() => setShowUserSelect(null)} title="Select User">
          <div className="flex flex-col gap-2">
            {users.length > 0 ? (
              <div className="flex flex-col gap-2">
                {users
                  .filter(user => !game.players.some(player => player.userId === user.id))
                  .map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(showUserSelect!, user.id)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <div className="font-medium">{user.name}</div>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>No users available.</p>
                <p className="text-sm">Please add users first.</p>
              </div>
            )}

            {users.filter(user => !game.players.some(player => player.userId === user.id)).length === 0 &&
              users.length > 0 && (
                <div className="text-center text-gray-500">
                  <p>All users are already assigned to players.</p>
                  <p className="text-sm">You need to add more users first.</p>
                </div>
              )}
          </div>
        </Modal>
      )}
    </div>
  )
}
