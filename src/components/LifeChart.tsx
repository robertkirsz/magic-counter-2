import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface LifeChartProps {
  gameId: string
}

interface LifeDataPoint {
  round: number
  turn: number
  turnLabel: string
  [playerName: string]: number | string
}

export const LifeChart: React.FC<LifeChartProps> = ({ gameId }) => {
  const { games } = useGames()
  const { users } = useUsers()

  const game = games.find((g: Game) => g.id === gameId)

  const chartData = useMemo(() => {
    if (!game) return { dataPoints: [], playerNames: [] }

    // Get player names
    const getPlayerName = (playerId: string | null) => {
      if (!playerId) return 'Unknown'
      const user = users.find(u => u.id === playerId)
      return user?.name || 'Unknown'
    }

    const playerNames = game.players.map((player: Player) => getPlayerName(player.userId))

    // Initialize data points with starting life values
    const dataPoints: LifeDataPoint[] = []
    let currentRound = 1
    let currentTurn = 1
    let turnCount = 0

    // Track current life values for each player
    const currentLifeValues: { [playerName: string]: number } = {}

    // Initialize with starting life values (typically 40 for Commander)
    game.players.forEach((_: Player, index: number) => {
      // TODO: Get starting life from Game options
      currentLifeValues[playerNames[index]] = 40 // Default starting life
    })

    // Add initial state
    const initialDataPoint: LifeDataPoint = {
      round: 1,
      turn: 1,
      turnLabel: 'Start'
    }

    // Copy current life values to initial data point
    Object.keys(currentLifeValues).forEach(playerName => {
      initialDataPoint[playerName] = currentLifeValues[playerName]
    })

    dataPoints.push(initialDataPoint)

    // Process actions to build life history
    game.actions.forEach((action: LifeChangeAction | TurnChangeAction) => {
      if (action.type === 'turn-change') {
        turnCount++

        // Calculate current round and turn
        if (turnCount % game.players.length === 0) {
          currentRound++
          currentTurn = 1
        } else {
          currentTurn++
        }

        // Create new data point
        const newDataPoint: LifeDataPoint = {
          round: currentRound,
          turn: currentTurn,
          turnLabel: `R${currentRound}T${currentTurn}`
        }

        // Copy current life values
        Object.keys(currentLifeValues).forEach(playerName => {
          newDataPoint[playerName] = currentLifeValues[playerName]
        })

        dataPoints.push(newDataPoint)
      } else if (action.type === 'life-change') {
        // Update current life values based on the action
        if (action.to) {
          action.to.forEach((playerId: string) => {
            const toPlayerIndex = game.players.findIndex((p: Player) => p.id === playerId)

            if (toPlayerIndex !== -1) {
              const playerName = playerNames[toPlayerIndex]
              currentLifeValues[playerName] += action.value
            }
          })
        }

        // Create new data point with updated values
        const newDataPoint: LifeDataPoint = {
          round: currentRound,
          turn: currentTurn,
          turnLabel: `R${currentRound}T${currentTurn}`
        }

        // Copy updated life values
        Object.keys(currentLifeValues).forEach(playerName => {
          newDataPoint[playerName] = currentLifeValues[playerName]
        })

        dataPoints.push(newDataPoint)
      }
    })

    return { dataPoints, playerNames }
  }, [game, users])

  if (!game || chartData.dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-400">No life data to display</p>
      </div>
    )
  }

  // Prepare data for Chart.js
  const labels = chartData.dataPoints.map(point => point.turnLabel)
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

  const datasets = chartData.playerNames.map((playerName, index) => ({
    label: playerName,
    data: chartData.dataPoints.map(point => point[playerName] as number),
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length],
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 4,
    tension: 0
  }))

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#6B7280',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1
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
          color: '#6B7280'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Life',
          color: '#6B7280'
        },
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#6B7280'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  }

  const data = {
    labels,
    datasets
  }

  return (
    <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Life Chart</h3>
      <div className="h-80 relative">
        <Line key={`life-chart-${gameId}`} data={data} options={options} />
      </div>
    </div>
  )
}
