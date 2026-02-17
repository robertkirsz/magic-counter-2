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

interface DamageChartProps {
  gameId: string
}

interface DamageDataPoint {
  round: number
  turn: number
  turnLabel: string
  [playerName: string]: number | string
}

export const DamageChart: React.FC<DamageChartProps> = ({ gameId }) => {
  const { games } = useGames()
  const { users } = useUsers()

  const game = games.find((g: Game) => g.id === gameId)

  const chartData = useMemo(() => {
    if (!game) return { dataPoints: [], playerNames: [] }

    // Get player names
    // TODO; duplicated in ActionsList.tsx
    const getPlayerName = (playerId?: string | null) => {
      if (!playerId) return 'Unknown'

      const player = game.players.find(p => p.id === playerId)

      if (!player?.userId) return 'Unknown'

      const user = users.find(u => u.id === player.userId)

      return user?.name || 'Unknown'
    }

    const playerNames = game.players.map((player: Player) => getPlayerName(player.id))

    // Initialize data points with damage tracking
    const dataPoints: DamageDataPoint[] = []
    let currentRound = 1
    let currentTurn = 1
    let turnCount = 0

    // Track damage dealt by each player per turn
    const damageDealtThisTurn: { [playerName: string]: number } = {}

    // Initialize damage tracking for each player
    playerNames.forEach(playerName => {
      damageDealtThisTurn[playerName] = 0
    })

    // Add initial state
    const initialDataPoint: DamageDataPoint = {
      round: 1,
      turn: 1,
      turnLabel: 'Start'
    }

    // Copy current damage values to initial data point
    Object.keys(damageDealtThisTurn).forEach(playerName => {
      initialDataPoint[playerName] = damageDealtThisTurn[playerName]
    })

    dataPoints.push(initialDataPoint)

    // Process actions to build damage history
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

        // Create new data point for turn change
        const newDataPoint: DamageDataPoint = {
          round: currentRound,
          turn: currentTurn,
          turnLabel: `R${currentRound}T${currentTurn}`
        }

        // Copy current damage values
        Object.keys(damageDealtThisTurn).forEach(playerName => {
          newDataPoint[playerName] = damageDealtThisTurn[playerName]
        })

        dataPoints.push(newDataPoint)
      } else if (action.type === 'life-change') {
        // Only track damage (negative life changes)
        if (action.value < 0 && action.from && action.to) {
          const fromPlayerName = getPlayerName(action.from)
          const damageAmount = Math.abs(action.value)

          // Add damage to the player who dealt it
          if (damageDealtThisTurn[fromPlayerName] !== undefined) {
            damageDealtThisTurn[fromPlayerName] += damageAmount
          }

          // Create new data point with updated damage values
          const newDataPoint: DamageDataPoint = {
            round: currentRound,
            turn: currentTurn,
            turnLabel: `R${currentRound}T${currentTurn}`
          }

          // Copy updated damage values
          Object.keys(damageDealtThisTurn).forEach(playerName => {
            newDataPoint[playerName] = damageDealtThisTurn[playerName]
          })

          dataPoints.push(newDataPoint)
        }
      }
    })

    return { dataPoints, playerNames }
  }, [game, users])

  // Compute player damage stats
  const playerStats = useMemo(() => {
    if (!game || chartData.dataPoints.length === 0 || chartData.playerNames.length === 0) {
      return { players: [], topDamager: null }
    }

    // Count turns from turn-change actions
    const totalTurns = game.actions.filter((a: LifeChangeAction | TurnChangeAction | MonarchChangeAction) => a.type === 'turn-change').length
    const turnsPerPlayer = Math.max(1, Math.floor(totalTurns / game.players.length))

    const lastPoint = chartData.dataPoints[chartData.dataPoints.length - 1]

    const players = chartData.playerNames.map(name => {
      const totalDamage = (lastPoint[name] as number) ?? 0
      const avgPerTurn = Math.round(totalDamage / turnsPerPlayer)
      return { name, totalDamage, avgPerTurn }
    })

    // Find top damager
    const topDamager = players.reduce(
      (top, p) => (p.totalDamage > (top?.totalDamage ?? 0) ? p : top),
      players[0]
    )

    return { players, topDamager: topDamager?.totalDamage > 0 ? topDamager : null }
  }, [game, chartData])

  if (!game || chartData.dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>

        <p className="text-muted-foreground">No damage data to display</p>
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
          text: 'Damage Dealt',
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
    <div className="flex-1 rounded-lg border bg-card p-4">
      <h3 className="text-lg font-semibold mb-4">Total Damage Chart</h3>

      {(playerStats.players.length > 0 || playerStats.topDamager) && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {playerStats.players.map(({ name, totalDamage, avgPerTurn }) => (
            <div key={name} className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: playerColorMap[name] }} />
                {name}
              </p>
              <p className="text-lg font-semibold">{totalDamage} damage</p>
              <div className="mt-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Avg/turn:</span> {avgPerTurn}
                </p>
              </div>
            </div>
          ))}
          {playerStats.topDamager && (
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Top Damager</p>
              <p className="text-lg font-semibold">{playerStats.topDamager.totalDamage} damage</p>
              <p className="text-sm">{playerStats.topDamager.name}</p>
            </div>
          )}
        </div>
      )}

      <div className="h-80 relative">
        <Line key={`damage-chart-${gameId}`} data={data} options={options} />
      </div>
    </div>
  )
}
