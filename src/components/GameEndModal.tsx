import { CheckIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useState } from 'react'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { generateId } from '../utils/idGenerator'
import { Button } from './Button'
import { Modal } from './Modal'

interface GameEndModalProps {
  gameId: string
  isOpen: boolean
  onClose: () => void
}

const WIN_CONDITIONS = [
  { value: 'combat-damage', label: 'Combat Damage' },
  { value: 'commander-damage', label: 'Commander Damage' },
  { value: 'poison', label: 'Poison' },
  { value: 'mill', label: 'Mill' },
  { value: 'card-rule', label: 'Card Rule' },
  { value: 'other', label: 'Other' }
] as const

export const GameEndModal: React.FC<GameEndModalProps> = ({ gameId, isOpen, onClose }) => {
  const { games, updateGame, dispatchAction, getCurrentActivePlayer } = useGames()
  const { users } = useUsers()
  const game = games.find(g => g.id === gameId)

  const [selectedWinner, setSelectedWinner] = useState<string>('')
  const [selectedWinCondition, setSelectedWinCondition] = useState<string>('')

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedWinner('')
      setSelectedWinCondition('')
    }
  }, [isOpen])

  if (!game) return null

  const handleSave = () => {
    if (!selectedWinner || !selectedWinCondition) return

    // Add a TurnChangeAction with to=null to mark game end
    const endAction: TurnChangeAction = {
      id: generateId(),
      createdAt: DateTime.now().toJSDate(),
      type: 'turn-change',
      from: getCurrentActivePlayer(gameId)
    }

    // Update the game with winner, win condition, and finished state
    updateGame(gameId, {
      winner: selectedWinner,
      winCondition: selectedWinCondition as WinCondition,
      state: 'finished'
    })

    // Dispatch the end action
    dispatchAction(gameId, endAction)

    onClose()
  }

  const handleCancel = () => {
    setSelectedWinner('')
    setSelectedWinCondition('')
    onClose()
  }

  const validPlayers = game.players.filter(player => player.userId)

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      {/* Winner Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Winner</label>
        <div className="grid grid-cols-2 gap-2">
          {validPlayers.map(player => {
            const user = users.find(u => u.id === player.userId)
            return (
              <button
                key={player.id}
                onClick={() => setSelectedWinner(player.userId!)}
                className={cn(
                  'p-3 rounded-lg border-2 transition-colors',
                  selectedWinner === player.userId
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{user?.name || 'Unknown Player'}</span>
                  {selectedWinner === player.userId && <CheckIcon className="w-4 h-4" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Win Condition Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Win Condition</label>
        <div className="grid grid-cols-2 gap-2">
          {WIN_CONDITIONS.map(condition => (
            <button
              key={condition.value}
              onClick={() => setSelectedWinCondition(condition.value)}
              className={cn(
                'p-3 rounded-lg border-2 transition-colors',
                selectedWinCondition === condition.value
                  ? 'border-green-500 bg-green-500/20 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{condition.label}</span>
                {selectedWinCondition === condition.value && <CheckIcon className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!selectedWinner || !selectedWinCondition} className="flex-1">
          Save
        </Button>
      </div>
    </Modal>
  )
}
