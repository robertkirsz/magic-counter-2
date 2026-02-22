import { MinusIcon, PlusIcon, SkullIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useCallback, useRef, useState } from 'react'

import { useDecks } from '../../hooks/useDecks'
import { useGames } from '../../hooks/useGames'
import { useLongPress } from '../../hooks/useLongPress'
import { cn } from '../../utils/cn'
import { useTurnChangeListener } from '../../utils/eventDispatcher'
import { generateId } from '../../utils/idGenerator'
import { CommanderDamage } from '../CommanderDamage'
import { MonarchToggle } from '../MonarchToggle'
import { PoisonCounters } from '../PoisonCounters'

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
  playerName?: string
  onPlayerNameClick?: () => void
}> = ({
  from,
  to,
  gameId,
  currentLife,
  attackMode = false,
  onLifeCommitted,
  commanderId,
  playerId,
  onPendingPoisonChange,
  playerName,
  onPlayerNameClick
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

  // TODO: Move to PoisonCounters?
  const pendingPoisonChange = poisonDamage ? -pendingLifeChanges : 0

  return (
    <div className="flex flex-col items-center justify-around h-full">
      <div className="flex gap-2 items-center">
        {/* Player name */}
        {playerName != null && (
          <span className="text-lg font-bold" onClick={onPlayerNameClick}>
            {playerName}
          </span>
        )}

        {/* Commander Damage Icon */}
        {commanderId && (
          <div className="flex justify-center">
            <button
              type="button"
              className={cn('btn btn-sm btn-circle', !commanderDamage && 'btn-ghost', commanderDamage && 'btn-primary')}
              onClick={() => setCommanderDamage(!commanderDamage)}
            >
              {/* Find svg icon for commander */}
              <img src="/icons/commander.png" className="size-4" />
            </button>
          </div>
        )}

        {/* Poison Toggle - Only show when infect option is available */}
        {hasInfectOption && (
          <div className="flex justify-center">
            <button
              type="button"
              // TODO: Use specific color rather than semantic color
              className={cn('btn btn-sm btn-circle', !poisonDamage && 'btn-ghost', poisonDamage && 'btn-success')}
              title={
                poisonDamage
                  ? 'Poison mode: - adds poison, + removes poison'
                  : 'Toggle poison mode: - adds poison, + removes poison'
              }
              onClick={() => setPoisonDamage(!poisonDamage)}
            >
              <SkullIcon className="size-4" />
            </button>
          </div>
        )}

        {/* Monarch Toggle */}
        {/* TODO: Don't display if monarch is not available in current decks */}
        {playerId && <MonarchToggle gameId={gameId} playerId={playerId} />}
      </div>

      {/* Life controls */}
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className="btn btn-ghost px-8 py-7 bg-transparent! border-none! shadow-none!"
          {...decrementHandlers}
        >
          <MinusIcon className="size-8" />
        </button>

        <div
          className={cn(
            'relative text-center',
            pendingLifeChanges !== 0 && !poisonDamage ? 'text-info' : 'text-base-content'
          )}
        >
          <span className="text-7xl font-bold">{displayLife}</span>

          {pendingLifeChanges !== 0 && !poisonDamage && (
            <span
              className={cn(
                'absolute text-sm left-1/2 top-full -translate-x-1/2',
                pendingLifeChanges > 0 ? 'text-success' : 'text-error'
              )}
            >
              {pendingLifeChanges > 0 ? '+' : ''}
              {pendingLifeChanges}
            </span>
          )}
        </div>

        {!attackMode && (
          <button
            type="button"
            disabled={commanderDamage}
            className="btn btn-ghost px-8 py-7 bg-transparent! border-none! shadow-none!"
            {...incrementHandlers}
          >
            <PlusIcon className="size-8" />
          </button>
        )}
      </div>

      {/* Damage counters */}
      {playerId != null && (
        <div className="flex items-center gap-2 min-h-8">
          <CommanderDamage gameId={gameId} playerId={playerId} />
          <PoisonCounters gameId={gameId} playerId={playerId} pendingChange={pendingPoisonChange} />
        </div>
      )}
    </div>
  )
}

export default PlayerLifeControls
