import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem
} from 'chart.js'
import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { getPlayerColor } from '../utils/playerColors'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface RoundDurationChartProps {
  gameId: string
}

interface DurationDataPoint {
  label: string
  duration: number
  round: number
  turn: number
  playerName: string
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

      // Calculate duration
      let duration = 0
      if (nextAction) {
        const currentTime = new Date(currentAction.createdAt).getTime()
        const nextTime = new Date(nextAction.createdAt).getTime()
        duration = Math.ceil((nextTime - currentTime) / 1000) // Convert to seconds, round up
      }

      // Add turn duration
      dataPoints.push({
        label: `R${currentRound}T${currentTurn}`,
        duration,
        round: currentRound,
        turn: currentTurn,
        playerName: getPlayerName(currentAction.to)
      })

      // Advance round and turn counters
      turnCount++
      if (turnCount % game.players.length === 0) {
        currentRound++
        currentTurn = 1
      } else {
        currentTurn++
      }
    }

    return { dataPoints, playerNames }
  }, [game, users])

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  // Compute player stats from data points
  const playerStats = useMemo(() => {
    const points = chartData.dataPoints.filter(p => p.duration > 0)
    if (points.length === 0) return { players: [], longest: null }

    // Group data points by player name
    const byPlayer: Record<string, DurationDataPoint[]> = {}
    for (const point of points) {
      if (!byPlayer[point.playerName]) {
        byPlayer[point.playerName] = []
      }
      byPlayer[point.playerName].push(point)
    }

    const players = Object.entries(byPlayer).map(([name, turns]) => {
      const average = Math.round(turns.reduce((sum, t) => sum + t.duration, 0) / turns.length)
      const longestTurn = turns.reduce((max, t) => (t.duration > max.duration ? t : max), turns[0])
      const shortestTurn = turns.reduce((min, t) => (t.duration < min.duration ? t : min), turns[0])
      return {
        name,
        average,
        longest: { duration: longestTurn.duration, round: longestTurn.round, turn: longestTurn.turn },
        shortest: { duration: shortestTurn.duration, round: shortestTurn.round, turn: shortestTurn.turn }
      }
    })

    // Find the overall longest turn
    const longestPoint = points.reduce((max, p) => (p.duration > max.duration ? p : max), points[0])
    const longest = {
      playerName: longestPoint.playerName,
      duration: longestPoint.duration,
      round: longestPoint.round,
      turn: longestPoint.turn
    }

    return { players, longest }
  }, [chartData.dataPoints])

  if (!game || chartData.dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-slate-400">No duration data to display</p>
      </div>
    )
  }

  // Build player color map
  const playerColorMap: Record<string, string> = {}
  chartData.playerNames.forEach((name, index) => {
    playerColorMap[name] = getPlayerColor(index)
  })

  // Prepare data for Chart.js
  const labels = chartData.dataPoints.map(point => point.label)
  const durations = chartData.dataPoints.map(point => point.duration)
  const colors = chartData.dataPoints.map(point => playerColorMap[point.playerName] ?? '#6B7280')

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
          title: function (tooltipItems: TooltipItem<'bar'>[]) {
            const index = tooltipItems[0].dataIndex
            const point = chartData.dataPoints[index]
            return [`Round ${point.round}`, `Turn ${point.turn}`, point.playerName]
          },
          label: function (context: TooltipItem<'bar'>) {
            const duration = context.parsed.y
            if (duration === null) return ''
            return formatDuration(duration)
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
            return formatDuration(duration)
          }
        }
      }
    }
  }

  return (
    <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Round Duration Chart</h3>

      {(playerStats.players.length > 0 || playerStats.longest) && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {playerStats.players.map(({ name, average, longest, shortest }) => (
            <div key={name} className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: playerColorMap[name] }} />
                {name}
              </p>
              <p className="text-lg font-semibold text-slate-100">Avg: {formatDuration(average)}</p>
              <div className="mt-1 space-y-0.5">
                <p className="text-sm text-slate-300">
                  <span className="text-slate-400">Longest:</span> {formatDuration(longest.duration)}{' '}
                  <span className="text-slate-500">R{longest.round}T{longest.turn}</span>
                </p>
                <p className="text-sm text-slate-300">
                  <span className="text-slate-400">Shortest:</span> {formatDuration(shortest.duration)}{' '}
                  <span className="text-slate-500">R{shortest.round}T{shortest.turn}</span>
                </p>
              </div>
            </div>
          ))}
          {playerStats.longest && (
            <div className="bg-slate-600/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Longest Turn</p>
              <p className="text-lg font-semibold text-slate-100">{formatDuration(playerStats.longest.duration)}</p>
              <p className="text-sm text-slate-300">
                {playerStats.longest.playerName} (R{playerStats.longest.round}T{playerStats.longest.turn})
              </p>
            </div>
          )}
        </div>
      )}

      <div className="h-80 relative">
        <Bar key={`round-duration-${gameId}`} data={data} options={options} />
      </div>
    </div>
  )
}
