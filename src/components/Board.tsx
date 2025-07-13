import { Play, Settings } from 'lucide-react'
import React, { useState } from 'react'

import { useGames } from '../contexts/GamesContext'
import { GameForm } from './GameForm'
import { Modal } from './Modal'
import { PlayerSection } from './PlayerSection'

interface BoardProps {
  gameId: string
}

export const Board: React.FC<BoardProps> = ({ gameId }) => {
  const { games, updateGame } = useGames()
  const [showSettings, setShowSettings] = useState(false)
  const game = games.find(g => g.id === gameId)

  if (!game) return <div>Game not found</div>

  const handlePlay = () => {
    updateGame(game.id, { state: 'active' })
  }

  const handleGameSettingsSave = (data: { players: Player[]; tracking: Game['tracking'] }) => {
    updateGame(game.id, {
      players: data.players,
      tracking: data.tracking
    })

    setShowSettings(false)
  }

  const validPlayers = game.players.filter(player => player.userId && player.deckId)
  const canPlay = validPlayers.length === game.players.length

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50">
      {/* Player Sections */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2">
        {game.players.map(player => (
          <PlayerSection key={player.id} playerId={player.id} />
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
    </div>
  )
}
