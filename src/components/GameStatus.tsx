import { Clock } from 'lucide-react'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'

interface GameStatusProps {
  gameId: string
}

export default function GameStatus({ gameId }: GameStatusProps) {
  const { games, getCurrentRound } = useGames()
  const [elapsedTime, setElapsedTime] = useState<string>('')
  const [isFinished, setIsFinished] = useState(false)

  const game = games.find(g => g.id === gameId)

  useEffect(() => {
    if (!game) return

    const updateTimer = () => {
      const turnActions = game.actions.filter(action => action.type === 'turn-change') as TurnChangeAction[]

      if (turnActions.length === 0) {
        setElapsedTime('')
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
      const duration = endTime.diff(gameStartTime)

      const hours = Math.floor(duration.as('hours'))
      const minutes = Math.floor(duration.as('minutes')) % 60
      const seconds = Math.floor(duration.as('seconds')) % 60

      if (hours > 0) {
        setElapsedTime(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }

      setIsFinished(finished)
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
        isFinished ? 'bg-green-800/90 text-white border-green-600' : 'bg-gray-800/90 text-white border-gray-700'
      )}
    >
      <span className="font-mono text-sm font-medium">{currentRound}</span>
      <Clock size={14} className={cn(isFinished ? 'text-green-400' : 'text-blue-400')} />
      <span className="font-mono text-sm font-medium">{elapsedTime}</span>
    </div>
  )
}
