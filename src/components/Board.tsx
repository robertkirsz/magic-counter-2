import { List, Play, Settings } from 'lucide-react'
import React, { useState } from 'react'

import { useGames } from '../hooks/useGames'
import { GameForm } from './GameForm'
import { Modal } from './Modal'
import { PlayerSection } from './PlayerSection'
import { ThreeDotMenu } from './ThreeDotMenu'

interface BoardProps {
  gameId: string
}

export const Board: React.FC<BoardProps> = ({ gameId }) => {
  const { games, updateGame } = useGames()
  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const game = games.find(g => g.id === gameId)

  if (!game) return <div>Game not found</div>

  const handlePlay = () => {
    updateGame(game.id, { state: 'active' })
  }

  const handleFinish = () => {
    updateGame(game.id, { state: 'finished' })
  }

  const validPlayers = game.players.filter(player => player.userId && player.deckId)
  const canPlay = validPlayers.length === game.players.length

  const formatAction = (action: LifeChangeAction | TurnChangeAction) => {
    const date = new Date(action.createdAt).toLocaleTimeString()

    if (action.type === 'life-change') {
      const sign = action.value > 0 ? '+' : ''
      return `${date}: ${action.from} ${sign}${action.value} life`
    } else if (action.type === 'turn-change') {
      return `${date}: Turn change`
    }

    return `${date}: Unknown action`
  }

  const handleActionRemove = (actionId: string) => {
    updateGame(game.id, {
      actions: game.actions.filter(action => action.id !== actionId)
    })
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50">
      {/* Player Sections */}
      <div className="flex-1 grid grid-cols-2">
        {game.players.map(player => (
          <PlayerSection key={player.id} gameId={gameId} playerId={player.id} />
        ))}
      </div>

      {/* Settings Overlay */}
      <div className="fixed top-2 right-2 flex flex-col gap-2">
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Settings size={24} />
        </button>

        <button
          onClick={() => setShowActions(true)}
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <List size={24} />
        </button>
      </div>

      {/* Play/Finish Button */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 flex justify-center w-full">
        {game.state !== 'finished' && (
          <button
            disabled={!canPlay && game.state !== 'active'}
            onClick={game.state === 'active' ? handleFinish : handlePlay}
            className={`bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {game.state === 'active' ? (
              <span className="text-lg font-bold">FINISH</span>
            ) : (
              <>
                <Play size={32} />
                <span className="text-lg font-bold">PLAY</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Game Settings">
          <GameForm gameId={gameId} onSave={() => setShowSettings(false)} onCancel={() => setShowSettings(false)} />
        </Modal>
      )}

      {/* Actions Modal */}
      {showActions && (
        <Modal isOpen={showActions} onClose={() => setShowActions(false)} title="Game Actions">
          <div className="flex flex-col gap-2">
            {game.actions.length === 0 ? (
              <p className="text-center text-gray-500">No actions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {game.actions.map(action => (
                  <div key={action.id} className="flex gap-1 p-2 border border-gray-200 rounded">
                    {formatAction(action)}
                    <ThreeDotMenu onClose={() => handleActionRemove(action.id)} asMenu={false} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
