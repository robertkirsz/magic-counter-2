import { MinusIcon, PlusIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useCallback, useRef, useState } from 'react'

import { useGames } from '../../hooks/useGames'
import { cn } from '../../utils/cn'
import { useTurnChangeListener } from '../../utils/eventDispatcher'
import { generateId } from '../../utils/idGenerator'
import { Button } from '../Button'

const PlayerLifeControls: React.FC<{
  from?: string
  to: string[]
  gameId: string
  currentLife: number
  attackMode?: boolean
  onLifeCommitted?: (action: LifeChangeAction) => void
  commanderId?: string
}> = ({ from, to, gameId, currentLife, attackMode = false, onLifeCommitted, commanderId }) => {
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

  const displayLife = currentLife + pendingLifeChanges
  const testId = to.join(',')

  return (
    <div className="flex flex-col gap-2">
      {/* Commander Damage Checkbox */}
      {commanderId && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`commander-damage-${testId}`}
            checked={commanderDamage}
            onChange={e => setCommanderDamage(e.target.checked)}
            // TODO: Check styles, reuse from Storybook
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor={`commander-damage-${testId}`} className="text-sm text-white">
            Commander damage
          </label>
        </div>
      )}

      <div className="grid grid-cols-3">
        <Button data-testid={`${testId}-remove-life`} className="text-4xl" onClick={() => handleLifeChange(-1)}>
          <MinusIcon className="w-6 h-6" />
        </Button>

        <div className={cn('relative text-center', pendingLifeChanges !== 0 ? 'text-blue-600' : 'text-white')}>
          <span data-testid={`${testId}-life`} className="text-4xl font-bold">
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
          <Button data-testid={`${testId}-add-life`} className="text-4xl" onClick={() => handleLifeChange(1)}>
            <PlusIcon className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default PlayerLifeControls
