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
    <div className="flex items-center gap-2">
      <Button
        data-testid={`${playerId}-remove-life`}
        className="text-4xl font-bold text-white"
        onClick={() => handleLifeChange(-1)}
      >
        -
      </Button>

      <div className={`text-4xl font-bold ${pendingLifeChanges !== 0 ? 'text-blue-600' : ''}`}>
        <span data-testid={`${playerId}-life`} className="text-white">
          {displayLife}
        </span>

        {pendingLifeChanges !== 0 && (
          <span className="text-sm text-gray-500 ml-1">
            ({pendingLifeChanges > 0 ? '+' : ''}
            {pendingLifeChanges})
          </span>
        )}
      </div>

      <Button
        data-testid={`${playerId}-add-life`}
        className="text-4xl font-bold text-white"
        onClick={() => handleLifeChange(1)}
      >
        +
      </Button>
    </div>
  )
}

export default PlayerLifeControls
