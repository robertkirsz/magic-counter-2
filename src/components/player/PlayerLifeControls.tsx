import { MinusIcon, PlusIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useCallback, useRef, useState } from 'react'

import { useDecks } from '../../hooks/useDecks'
import { useGames } from '../../hooks/useGames'
import { useLongPress } from '../../hooks/useLongPress'
import { cn } from '../../utils/cn'
import { useTurnChangeListener } from '../../utils/eventDispatcher'
import { generateId } from '../../utils/idGenerator'
import { MonarchToggle } from '../MonarchToggle'

const PlayerLifeControls: React.FC<{
  from?: string
  to: string[]
  gameId: string
  currentLife: number
  attackMode?: boolean
  onLifeCommitted?: (action: LifeChangeAction) => void
  commanderId?: string
  playerId?: string
  onPendingPoisonChange?: (pendingChange: number) => void
}> = ({
  from,
  to,
  gameId,
  currentLife,
  attackMode = false,
  onLifeCommitted,
  commanderId,
  playerId,
  onPendingPoisonChange
}) => {
  const { dispatchAction, games } = useGames()
  const { decks } = useDecks()
  const [pendingLifeChanges, setPendingLifeChanges] = useState<number>(0)
  const [commanderDamage, setCommanderDamage] = useState<boolean>(false)
  const [poisonDamage, setPoisonDamage] = useState<boolean>(false)

  // Check if any deck in the game has infect option
  const game = games.find(g => g.id === gameId)
  const hasInfectOption = game?.players.some(p => {
    if (!p.deckId) return false
    const deck = decks.find(d => d.id === p.deckId)
    return deck?.options?.includes('infect')
  })

  // Debouncing for life changes
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingLifeChangesRef = useRef<number>(0)

  const commitLifeChanges = useCallback(() => {
    if (pendingLifeChangesRef.current === 0) return

    const newAction: LifeChangeAction = {
      id: generateId(),
      createdAt: DateTime.now().toJSDate(),
      type: 'life-change',
      value: pendingLifeChangesRef.current,
      from,
      to,
      ...(commanderDamage && commanderId && { commanderId }),
      // When poison toggle is on, mark the action as poison (works for both damage and healing)
      ...(poisonDamage && { poison: true })
    }

    dispatchAction(gameId, newAction)
    onLifeCommitted?.(newAction)

    pendingLifeChangesRef.current = 0
    setPendingLifeChanges(0)
    setCommanderDamage(false)
    setPoisonDamage(false)
  }, [dispatchAction, from, gameId, onLifeCommitted, to, commanderDamage, commanderId, poisonDamage])

  // Clear timeout and commit life changes when a turn is passed
  useTurnChangeListener(event => {
    if (event.detail.gameId === gameId && pendingLifeChangesRef.current !== 0) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
      commitLifeChanges()
    }
  })

  const handleLifeChange = (value: number) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)

    pendingLifeChangesRef.current += value

    setPendingLifeChanges(prev => prev + value)

    debounceTimeoutRef.current = setTimeout(commitLifeChanges, 1500)
  }

  const handleLongPressLifeChange = (value: number) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)

    // Long press changes life by 10 instead of 1
    const longPressValue = value * 10
    pendingLifeChangesRef.current += longPressValue

    setPendingLifeChanges(prev => prev + longPressValue)

    debounceTimeoutRef.current = setTimeout(commitLifeChanges, 1500)
  }

  // When poison toggle is on, pending changes affect poison counters, not life
  const displayLife = poisonDamage ? currentLife : currentLife + pendingLifeChanges

  // Calculate pending poison counter change and notify parent
  // When poison toggle is on: negative pendingLifeChanges adds poison, positive removes poison
  React.useEffect(() => {
    if (onPendingPoisonChange) {
      if (poisonDamage) {
        // When poison toggle is on: negative pendingLifeChanges adds poison, positive removes poison
        onPendingPoisonChange(-pendingLifeChanges)
      } else {
        onPendingPoisonChange(0)
      }
    }
  }, [poisonDamage, pendingLifeChanges, onPendingPoisonChange])

  const decrementHandlers = useLongPress({
    onLongPress: () => handleLongPressLifeChange(-1),
    onPress: () => handleLifeChange(-1),
    shouldStopPropagation: false
  })

  const incrementHandlers = useLongPress({
    onLongPress: () => handleLongPressLifeChange(1),
    onPress: () => handleLifeChange(1),
    shouldStopPropagation: false
  })

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <div className="flex gap-2">
        {/* Commander Damage Icon */}
        {commanderId && (
          <div className="flex justify-center">
            <button
              type="button"
              className={cn(
                'btn btn-sm',
                commanderDamage && 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-500'
              )}
              onClick={() => setCommanderDamage(!commanderDamage)}
            >
              <img src="/icons/commander.png" className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Poison Toggle - Only show when infect option is available */}
        {hasInfectOption && (
          <div className="flex justify-center">
            <button
              type="button"
              className={cn(
                'btn btn-sm',
                poisonDamage && 'bg-green-600/90 hover:bg-green-500 text-white border-green-500'
              )}
              title={
                poisonDamage
                  ? 'Poison mode: - adds poison, + removes poison'
                  : 'Toggle poison mode: - adds poison, + removes poison'
              }
              onClick={() => setPoisonDamage(!poisonDamage)}
            >
              ☠️
            </button>
          </div>
        )}

        {/* Monarch Toggle */}
        {playerId && (
          <div className="flex justify-center">
            <MonarchToggle gameId={gameId} playerId={playerId} />
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <button type="button" className="btn px-6! py-3!" {...decrementHandlers}>
          <MinusIcon className="w-8 h-8" />
        </button>

        <div
          className={cn(
            'relative text-center',
            pendingLifeChanges !== 0 && !poisonDamage ? 'text-blue-600' : 'text-white'
          )}
        >
          <span className="text-4xl font-bold">{displayLife}</span>

          {pendingLifeChanges !== 0 && !poisonDamage && (
            <span
              className={cn(
                'absolute text-sm left-1/2 top-full -translate-x-1/2',
                pendingLifeChanges > 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {pendingLifeChanges > 0 ? '+' : ''}
              {pendingLifeChanges}
            </span>
          )}
        </div>

        {!attackMode && (
          <button type="button" disabled={commanderDamage} className="btn px-6! py-3!" {...incrementHandlers}>
            <PlusIcon className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  )
}

export default PlayerLifeControls
