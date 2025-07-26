import { MinusIcon, PlusIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useGames } from '../../hooks/useGames'
import { Button } from '../Button'

const PlayerLifeControls: React.FC<{
  playerId: string
  gameId: string
  currentLife: number
  onLifeCommitted?: (action: LifeChangeAction) => void
}> = ({ playerId, gameId, currentLife, onLifeCommitted }) => {
  const { getCurrentActivePlayer, dispatchAction } = useGames()
  const [pendingLifeChanges, setPendingLifeChanges] = useState<number>(0)

  // Debouncing for life changes
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingLifeChangesRef = useRef<number>(0)

  const commitLifeChanges = useCallback(() => {
    if (pendingLifeChangesRef.current === 0) return

    const fromId = getCurrentActivePlayer() || playerId

    const newAction: LifeChangeAction = {
      id: uuidv4(),
      createdAt: DateTime.now().toJSDate(),
      type: 'life-change',
      value: pendingLifeChangesRef.current,
      from: fromId,
      to: [playerId]
    }

    dispatchAction(gameId, newAction)
    onLifeCommitted?.(newAction)

    pendingLifeChangesRef.current = 0
    setPendingLifeChanges(0)
  }, [playerId, gameId, dispatchAction, getCurrentActivePlayer, onLifeCommitted])

  const handleLifeChange = (value: number) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)

    pendingLifeChangesRef.current += value

    setPendingLifeChanges(prev => prev + value)

    debounceTimeoutRef.current = setTimeout(commitLifeChanges, 1500)
  }

  const displayLife = currentLife + pendingLifeChanges

  return (
    <div className="grid grid-cols-3">
      <Button
        data-testid={`${playerId}-remove-life`}
        variant="ghost"
        className="text-4xl"
        onClick={() => handleLifeChange(-1)}
      >
        <MinusIcon className="w-6 h-6" />
      </Button>

      <div className={`relative text-center text-white`}>
        <span data-testid={`${playerId}-life`} className="text-4xl font-bold">
          {displayLife}
        </span>

        {pendingLifeChanges !== 0 && (
          <span
            className={`absolute text-sm ${pendingLifeChanges > 0 ? 'text-green-600' : 'text-red-600'} left-1/2 top-full -translate-x-1/2`}
          >
            {pendingLifeChanges > 0 ? '+' : ''}
            {pendingLifeChanges}
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        data-testid={`${playerId}-add-life`}
        className="text-4xl"
        onClick={() => handleLifeChange(1)}
      >
        <PlusIcon className="w-6 h-6" />
      </Button>
    </div>
  )
}

export default PlayerLifeControls
