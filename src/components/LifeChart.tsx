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
import { getPlayerColor } from '../utils/playerColors'

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
    game.actions.forEach((action: LifeChangeAction | TurnChangeAction | MonarchChangeAction) => {
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
              // Poison damage does not reduce life, only adds poison counters
              if (!action.poison) {
                currentLifeValues[playerName] += action.value
              }
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

  // Compute player life stats
  const playerStats = useMemo(() => {
    if (!game || chartData.dataPoints.length === 0 || chartData.playerNames.length === 0) {
      return { players: [], biggestHit: null }
    }

    const players = chartData.playerNames.map(name => {
      const values = chartData.dataPoints.map(p => p[name] as number).filter(v => typeof v === 'number')
      const startLife = values[0] ?? 0
      const finalLife = values[values.length - 1] ?? 0
      const peak = Math.max(...values)
      const lowest = Math.min(...values)
      const netChange = finalLife - startLife
      return { name, finalLife, peak, lowest, netChange }
    })

    // Find biggest single hit (largest negative life-change action)
    let biggestHit: { from: string; to: string; damage: number; round: number; turn: number } | null = null
    const getPlayerNameById = (playerId?: string | null) => {
      if (!playerId) return 'Unknown'
      const player = game.players.find((p: Player) => p.id === playerId)
      if (!player?.userId) return 'Unknown'
      const user = users.find((u: User) => u.id === player.userId)
      return user?.name || 'Unknown'
    }

    let hitRound = 1
    let hitTurn = 1
    let hitTurnCount = 0

    for (const action of game.actions) {
      if (action.type === 'turn-change') {
        hitTurnCount++
        if (hitTurnCount % game.players.length === 0) {
          hitRound++
          hitTurn = 1
        } else {
          hitTurn++
        }
      } else if (action.type === 'life-change' && action.value < 0 && !action.poison) {
        const damage = Math.abs(action.value)
        if (!biggestHit || damage > biggestHit.damage) {
          const fromName = action.from ? getPlayerNameById(action.from) : 'Unknown'
          const toName = action.to?.length ? getPlayerNameById(action.to[0]) : 'Unknown'
          biggestHit = { from: fromName, to: toName, damage, round: hitRound, turn: hitTurn }
        }
      }
    }

    return { players, biggestHit }
  }, [game, users, chartData])

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

  // Build player color map
  const playerColorMap: Record<string, string> = {}
  chartData.playerNames.forEach((name, index) => {
    playerColorMap[name] = getPlayerColor(index)
  })

  // Prepare data for Chart.js
  const labels = chartData.dataPoints.map(point => point.turnLabel)

  const datasets = chartData.playerNames.map((playerName, index) => ({
    label: playerName,
    data: chartData.dataPoints.map(point => point[playerName] as number),
    borderColor: getPlayerColor(index),
    backgroundColor: getPlayerColor(index),
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

      {(playerStats.players.length > 0 || playerStats.biggestHit) && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {playerStats.players.map(({ name, finalLife, peak, lowest, netChange }) => (
            <div key={name} className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: playerColorMap[name] }}
                />
                {name}
              </p>
              <p className="text-lg font-semibold text-gray-100">
                {finalLife} HP{' '}
                <span className={`text-sm font-normal ${netChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ({netChange >= 0 ? '+' : ''}
                  {netChange})
                </span>
              </p>
              <div className="mt-1 space-y-0.5">
                <p className="text-sm text-gray-300">
                  <span className="text-gray-400">Peak:</span> {peak} HP
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-gray-400">Lowest:</span> {lowest} HP
                </p>
              </div>
            </div>
          ))}
          {playerStats.biggestHit && (
            <div className="bg-gray-600/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Biggest Hit</p>
              <p className="text-lg font-semibold text-gray-100">{playerStats.biggestHit.damage} damage</p>
              <p className="text-sm text-gray-300">
                {playerStats.biggestHit.from} <span className="text-gray-500">dealt to</span>{' '}
                {playerStats.biggestHit.to}{' '}
                <span className="text-gray-500">
                  R{playerStats.biggestHit.round}T{playerStats.biggestHit.turn}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="h-80 relative">
        <Line key={`life-chart-${gameId}`} data={data} options={options} />
      </div>
    </div>
  )
}
