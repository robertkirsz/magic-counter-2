import { MinusIcon, PlusIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useCallback, useRef, useState } from 'react'

import { useGames } from '../../hooks/useGames'
import { cn } from '../../utils/cn'
import { useTurnChangeListener } from '../../utils/eventDispatcher'
import { generateId } from '../../utils/idGenerator'
import { Button } from '../Button'

const PlayerLifeControls: React.FC<{
  testId?: string
  from?: string
  to: string[]
  gameId: string
  currentLife: number
  attackMode?: boolean
  onLifeCommitted?: (action: LifeChangeAction) => void
  commanderId?: string
}> = ({ testId, from, to, gameId, currentLife, attackMode = false, onLifeCommitted, commanderId }) => {
  const { dispatchAction } = useGames()
  const [pendingLifeChanges, setPendingLifeChanges] = useState<number>(0)
  const [commanderDamage, setCommanderDamage] = useState<boolean>(false)

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
      ...(commanderDamage && commanderId && { commanderId })
    }

    dispatchAction(gameId, newAction)
    onLifeCommitted?.(newAction)

    pendingLifeChangesRef.current = 0
    setPendingLifeChanges(0)
    setCommanderDamage(false)
  }, [dispatchAction, from, gameId, onLifeCommitted, to, commanderDamage, commanderId])

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

  const displayLife = currentLife + pendingLifeChanges
  const _testId = testId ? `${testId}-${to.join(',')}` : to.join(',')

  return (
    <div className="flex flex-col gap-2">
      {/* Commander Damage Icon */}
      {commanderId && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setCommanderDamage(!commanderDamage)}
            className={cn(
              'p-2 rounded-lg transition-all duration-200 hover:bg-gray-700',
              commanderDamage && 'ring-2 ring-blue-500 ring-opacity-75'
            )}
            title={commanderDamage ? 'Commander damage active' : 'Click to enable commander damage'}
          >
            <img
              src="/icons/commander.png"
              alt="Commander"
              className={cn(
                'w-8 h-8 transition-all duration-200',
                commanderDamage && 'filter brightness-110 contrast-125 saturate-150'
              )}
            />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3">
        <Button
          data-testid={`${_testId}-remove-life`}
          className="text-4xl"
          onClick={() => handleLifeChange(-1)}
          onLongPress={() => handleLongPressLifeChange(-1)}
        >
          <MinusIcon className="w-6 h-6" />
        </Button>

        <div className={cn('relative text-center', pendingLifeChanges !== 0 ? 'text-blue-600' : 'text-white')}>
          <span data-testid={`${_testId}-life`} className="text-4xl font-bold">
            {displayLife}
          </span>

          {pendingLifeChanges !== 0 && (
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
          <Button
            data-testid={`${_testId}-add-life`}
            className="text-4xl"
            onClick={() => handleLifeChange(1)}
            onLongPress={() => handleLongPressLifeChange(1)}
          >
            <PlusIcon className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default PlayerLifeControls
