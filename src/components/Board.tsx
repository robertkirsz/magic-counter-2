import { List, Play, Settings } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { GameForm } from './GameForm'
import { Modal } from './Modal'
import { PlayerSection } from './PlayerSection'
import { ThreeDotMenu } from './ThreeDotMenu'

interface BoardProps {
  gameId: string
}

export const Board: React.FC<BoardProps> = ({ gameId }) => {
  const { games, updateGame } = useGames()
  const { users } = useUsers()

  const game = games.find(g => g.id === gameId)
  const previousActivePlayerRef = useRef<string | null | undefined>(game?.activePlayer)

  const [showStartModal, setShowStartModal] = useState(game?.state === 'active' && game?.activePlayer === undefined)
  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showPlayerChoice, setShowPlayerChoice] = useState(false)

  // Track activePlayer changes and dispatch TurnChangeAction
  useEffect(() => {
    if (!game) return

    const currentActivePlayer = game.activePlayer
    const previousActivePlayer = previousActivePlayerRef.current

    if (currentActivePlayer !== previousActivePlayer) {
      const newAction: TurnChangeAction = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        type: 'turn-change',
        from: previousActivePlayer || null,
        to: currentActivePlayer || null
      }

      updateGame(game.id, { actions: [...game.actions, newAction] })
    }

    // Update the ref for next comparison
    previousActivePlayerRef.current = currentActivePlayer
  }, [game?.activePlayer, game, updateGame])

  if (!game) return <div>Game not found</div>

  const handlePlay = () => {
    updateGame(game.id, { state: 'active' })
    setShowStartModal(true)
  }

  const handleFinish = () => {
    updateGame(game.id, { state: 'finished' })
  }

  const validPlayers = game.players.filter(player => player.userId && player.deckId)
  const canPlay = validPlayers.length === game.players.length

  const handleChooseAtRandom = () => {
    const players = validPlayers
    const randomIndex = Math.floor(Math.random() * players.length)
    const selectedPlayer = players[randomIndex]

    updateGame(game.id, { activePlayer: selectedPlayer.id })
    setShowStartModal(false)
  }

  const handleChoosePlayer = (playerId: string) => {
    updateGame(game.id, { activePlayer: playerId })
    resetState()
  }

  const handleSkip = () => {
    updateGame(game.id, { activePlayer: null })
    resetState()
  }

  const resetState = () => {
    setShowStartModal(false)
    setShowPlayerChoice(false)
  }

  const formatAction = (action: LifeChangeAction | TurnChangeAction) => {
    const date = new Date(action.createdAt).toLocaleTimeString()

    if (action.type === 'life-change') {
      const sign = action.value > 0 ? '+' : ''
      return `${date}: ${action.from} ${sign}${action.value} life`
    } else if (action.type === 'turn-change') {
      return `${date}: Turn change from ${action.from} to ${action.to}`
    }

    return `${date}: Unknown action`
  }

  const handleActionRemove = (actionId: string) => {
    updateGame(game.id, {
      actions: game.actions.filter(action => action.id !== actionId)
    })
  }

  const getPlayerName = (playerId: string) => {
    const player = game.players.find(p => p.id === playerId)
    if (!player?.userId) return 'Unknown Player'
    const user = users.find(u => u.id === player.userId)
    return user?.name || 'Unknown User'
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50">
      <span style={{ position: 'absolute' }}>
        {game.activePlayer}
        {game.activePlayer === undefined && 'undefined'}
        {game.activePlayer === null && 'null'}
      </span>

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

      {/* Start Game Modal */}
      {showStartModal && (
        <Modal isOpen={showStartModal} onClose={handleSkip} title="Who starts?">
          {!showPlayerChoice && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleChooseAtRandom}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Random
                </button>
                <button
                  onClick={() => setShowPlayerChoice(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Choose
                </button>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Player Choice Modal */}
          {showPlayerChoice && (
            <div className="flex flex-col gap-2">
              {validPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleChoosePlayer(player.id)}
                  className="p-3 border border-gray-200 rounded hover:bg-gray-50 transition text-left"
                >
                  {getPlayerName(player.id)}
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
