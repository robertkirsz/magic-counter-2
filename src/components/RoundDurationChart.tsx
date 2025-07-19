import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface RoundDurationChartProps {
  gameId: string
}

interface DurationDataPoint {
  label: string
  duration: number
  type: 'round' | 'turn'
  round: number
  turn: number
}

export const RoundDurationChart: React.FC<RoundDurationChartProps> = ({ gameId }) => {
  const { games } = useGames()
  const { users } = useUsers()

  const game = games.find((g: Game) => g.id === gameId)

  const chartData = useMemo(() => {
    if (!game) return { dataPoints: [], playerNames: [] }

    // Get player names
    const getPlayerName = (playerId?: string | null) => {
      if (!playerId) return 'Unknown'

      const player = game.players.find(p => p.id === playerId)

      if (!player?.userId) return 'Unknown'

      const user = users.find(u => u.id === player.userId)

      return user?.name || 'Unknown'
    }

    const playerNames = game.players.map((player: Player) => getPlayerName(player.id))

    // Initialize data points with duration tracking
    const dataPoints: DurationDataPoint[] = []
    let currentRound = 1
    let currentTurn = 1
    let turnCount = 0

    // Track turn change actions
    const turnChangeActions = game.actions.filter(action => action.type === 'turn-change') as TurnChangeAction[]

    if (turnChangeActions.length === 0) {
      return { dataPoints: [], playerNames }
    }

    // Calculate duration for each turn
    for (let i = 0; i < turnChangeActions.length; i++) {
      const currentAction = turnChangeActions[i]
      const nextAction = turnChangeActions[i + 1]

      turnCount++

      // Calculate current round and turn
      if (turnCount % game.players.length === 0) {
        currentRound++
        currentTurn = 1
      } else {
        currentTurn++
      }

      // Calculate duration
      let duration = 0
      if (nextAction) {
        const currentTime = new Date(currentAction.createdAt).getTime()
        const nextTime = new Date(nextAction.createdAt).getTime()
        duration = (nextTime - currentTime) / 1000 // Convert to seconds
      }

      // Add turn duration
      dataPoints.push({
        label: `R${currentRound}T${currentTurn}`,
        duration,
        type: 'turn',
        round: currentRound,
        turn: currentTurn
      })

      // If this completes a round, add round duration
      if (turnCount % game.players.length === 0) {
        const roundStartAction = turnChangeActions[i - (game.players.length - 1)]
        const roundEndAction = currentAction

        if (roundStartAction) {
          const roundStartTime = new Date(roundStartAction.createdAt).getTime()
          const roundEndTime = new Date(roundEndAction.createdAt).getTime()
          const roundDuration = (roundEndTime - roundStartTime) / 1000

          dataPoints.push({
            label: `Round ${currentRound - 1}`,
            duration: roundDuration,
            type: 'round',
            round: currentRound,
            turn: 0
          })
        }
      }
    }

    return { dataPoints, playerNames }
  }, [game, users])

  if (!game || chartData.dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">No duration data to display</p>
      </div>
    )
  }

  // Prepare data for Chart.js
  const labels = chartData.dataPoints.map(point => point.label)
  const durations = chartData.dataPoints.map(point => point.duration)
  const colors = chartData.dataPoints.map(point => (point.type === 'round' ? '#EF4444' : '#3B82F6'))

  const data = {
    labels,
    datasets: [
      {
        label: 'Duration (seconds)',
        data: durations,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function (context: { parsed: { y: number } }) {
            const duration = context.parsed.y
            const minutes = Math.floor(duration / 60)
            const seconds = Math.floor(duration % 60)

            if (minutes > 0) {
              return `${minutes}m ${seconds}s`
            } else {
              return `${seconds}s`
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false
        },
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#6B7280',
          maxRotation: 45
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Duration (seconds)',
          color: '#6B7280'
        },
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#6B7280',
          callback: function (value: number | string) {
            const duration = typeof value === 'string' ? parseFloat(value) : value
            const minutes = Math.floor(duration / 60)
            const seconds = Math.floor(duration % 60)

            if (minutes > 0) {
              return `${minutes}m ${seconds}s`
            } else {
              return `${seconds}s`
            }
          }
        }
      }
    }
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Round Duration Chart</h3>
      <div className="h-80 relative">
        <Bar key={`round-duration-${gameId}`} data={data} options={options} />
      </div>
    </div>
  )
}
