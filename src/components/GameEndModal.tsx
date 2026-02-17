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
  const { games, updateGame, dispatchAction, getEffectiveActivePlayer } = useGames()
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
      from: getEffectiveActivePlayer(gameId)
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
              <Button
                key={player.id}
                type="button"
                variant={selectedWinner === player.userId ? 'primary' : 'default'}
                onClick={() => setSelectedWinner(player.userId!)}
                className={cn(
                  'h-auto justify-between p-3',
                  selectedWinner !== player.userId && 'text-slate-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{user?.name || 'Unknown Player'}</span>
                  {selectedWinner === player.userId && <CheckIcon className="w-4 h-4" />}
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Win Condition Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Win Condition</label>
        <div className="grid grid-cols-2 gap-2">
          {WIN_CONDITIONS.map(condition => (
            <Button
              key={condition.value}
              type="button"
              variant={selectedWinCondition === condition.value ? 'primary' : 'default'}
              onClick={() => setSelectedWinCondition(condition.value)}
              className={cn(
                'h-auto justify-between p-3',
                selectedWinCondition !== condition.value && 'text-slate-300'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{condition.label}</span>
                {selectedWinCondition === condition.value && <CheckIcon className="w-4 h-4" />}
              </div>
            </Button>
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
