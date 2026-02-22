import { Clock } from 'lucide-react'
import { DateTime, Duration } from 'luxon'
import { useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'

interface GameStatusProps {
  gameId: string
}

export default function GameStatus({ gameId }: GameStatusProps) {
  const { games, getCurrentRound } = useGames()
  const [elapsedTime, setElapsedTime] = useState<string>('')
  const [turnElapsedTime, setTurnElapsedTime] = useState<string>('')
  const [isFinished, setIsFinished] = useState(false)

  const game = games.find(g => g.id === gameId)

  const formatDuration = (duration: Duration) => {
    const hours = Math.floor(duration.as('hours'))
    const minutes = Math.floor(duration.as('minutes')) % 60
    const seconds = Math.floor(duration.as('seconds')) % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!game) return

    const updateTimer = () => {
      const turnActions = game.actions.filter(action => action.type === 'turn-change') as TurnChangeAction[]

      if (turnActions.length === 0) {
        setElapsedTime('')
        setTurnElapsedTime('')
        setIsFinished(false)
        return
      }

      const gameStartTime = DateTime.fromJSDate(turnActions[0].createdAt)
      let gameEndTime: DateTime | null = null
      let finished = false

      // Find the last TurnChangeAction with to=null (game end)
      for (let i = turnActions.length - 1; i >= 0; i--) {
        if (turnActions[i].to === null) {
          gameEndTime = DateTime.fromJSDate(turnActions[i].createdAt)
          finished = true
          break
        }
      }

      const endTime = gameEndTime || DateTime.now()
      setElapsedTime(formatDuration(endTime.diff(gameStartTime)))
      setIsFinished(finished)

      // Current turn elapsed: last turn-change with to !== null
      if (!finished) {
        for (let i = turnActions.length - 1; i >= 0; i--) {
          if (turnActions[i].to != null) {
            const turnStartTime = DateTime.fromJSDate(turnActions[i].createdAt)
            setTurnElapsedTime(formatDuration(DateTime.now().diff(turnStartTime)))
            break
          }
        }
      } else {
        setTurnElapsedTime('')
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [game])

  if (!game || game.state !== 'active') return null

  const currentRound = getCurrentRound(gameId)

  return (
    <div
      className={cn(
        'px-2 py-1 rounded-lg shadow-lg border flex items-center gap-2 pointer-events-none',
        isFinished
          ? 'bg-success/90 text-success-content border-success'
          : 'bg-base-200/90 text-base-content border-base-300'
      )}
    >
      <span className="font-mono text-sm font-medium">{currentRound}</span>

      {elapsedTime && (
        <>
          <Clock size={14} className={cn(isFinished ? 'text-success' : 'text-info')} />
          {turnElapsedTime && <span className="font-mono text-sm font-medium">{turnElapsedTime}</span>}
          <span className="font-mono text-sm font-medium opacity-70">({elapsedTime})</span>
        </>
      )}
    </div>
  )
}
