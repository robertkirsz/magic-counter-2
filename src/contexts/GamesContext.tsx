import { DateTime } from 'luxon'
import React, { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { GamesContext, type GamesContextType } from './GamesContextDef'

interface GamesProviderProps {
  children: React.ReactNode
}

const LOCAL_STORAGE_KEY = 'games'

const readGames = (): Game[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((g: Game) => ({
        ...g,
        createdAt: new Date(g.createdAt),
        actions: g.actions.map((action: LifeChangeAction | TurnChangeAction) => ({
          ...action,
          createdAt: new Date(action.createdAt)
        }))
      }))
    }

    return []
  } catch (e) {
    window.alert(
      `Could not load game data from localStorage (key: ${LOCAL_STORAGE_KEY}).\nError: ${e instanceof Error ? e.message : e}`
    )

    if (window.confirm('Clear the corrupted data and load default state?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      window.location.reload()
    }

    return []
  }
}

export const GamesProvider: React.FC<GamesProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>(readGames())
  const [turnChangeCallbacks, setTurnChangeCallbacks] = useState<Map<string, (() => void)[]>>(new Map())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games)), [games])

  const addGame: GamesContextType['addGame'] = gameData => {
    const newGame: Game = {
      ...gameData,
      id: uuidv4(),
      createdAt: DateTime.now().toJSDate(),
      state: 'setup',
      activePlayerId: null,
      actions: []
    }

    setGames(prev => [...prev, newGame])

    return newGame.id
  }

  const removeGame = (gameId: string) => {
    setGames(prev => prev.filter(game => game.id !== gameId))
  }

  const updateGame = (gameId: string, updates: Partial<Game> | ((game: Game) => Partial<Game>)) => {
    setGames(prev =>
      prev.map(game => {
        if (game.id !== gameId) return game
        const updateObj = typeof updates === 'function' ? updates(game) : updates
        return { ...game, ...updateObj }
      })
    )
  }

  const registerTurnChangeCallback = useCallback((gameId: string, callback: () => void) => {
    setTurnChangeCallbacks(prev => {
      const newCallbacks = new Map(prev)
      const existingCallbacks = newCallbacks.get(gameId) || []
      newCallbacks.set(gameId, [...existingCallbacks, callback])
      return newCallbacks
    })
  }, [])

  const unregisterTurnChangeCallback = useCallback((gameId: string, callback: () => void) => {
    setTurnChangeCallbacks(prev => {
      const newCallbacks = new Map(prev)
      const existingCallbacks = newCallbacks.get(gameId) || []
      newCallbacks.set(
        gameId,
        existingCallbacks.filter(cb => cb !== callback)
      )
      return newCallbacks
    })
  }, [])

  const dispatchAction = (gameId: string, action: LifeChangeAction | TurnChangeAction) => {
    // Call turn change callbacks before adding the action
    if (action.type === 'turn-change') {
      const callbacks = turnChangeCallbacks.get(gameId) || []
      callbacks.forEach(callback => callback())
    }

    setGames(prev =>
      prev.map(game => {
        if (game.id !== gameId) return game
        return { ...game, actions: [...game.actions, action] }
      })
    )
  }

  const undoLastAction = useCallback((gameId: string) => {
    setGames(prev =>
      prev.map(game => {
        if (game.id !== gameId) return game
        const newActions = game.actions.slice(0, -1) // Remove the last action
        return { ...game, actions: newActions }
      })
    )
  }, [])

  const latestActiveGame = games.filter(g => g.state === 'active').pop()

  const getCurrentActivePlayer = (gameId?: string): string | null => {
    const game = games.find(g => g.id === gameId) || latestActiveGame

    if (!game) return null

    if (game.state !== 'active') return null

    const lastTurn = [...game.actions].reverse().find(a => a.type === 'turn-change') as TurnChangeAction | undefined

    if (!lastTurn) return null

    return lastTurn.to
  }

  // Derived round functions
  const getCurrentRound = (gameId: string): number => {
    const game = games.find(g => g.id === gameId)

    // If no game, we're in round 1
    if (!game) return 1

    // Filter out the first turn change action, which is the start of the game
    const turnChangeActions = game.actions.filter(action => action.type === 'turn-change' && action.from !== null)

    // If no turns have been taken, we're in round 1
    if (turnChangeActions.length === 0) return 1

    // Calculate which round we're currently in
    const completedRounds = Math.floor(turnChangeActions.length / game.players.length)
    const currentRound = completedRounds + 1

    return currentRound
  }

  const groupActionsByRound = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    if (!game) return []

    const groups: Array<{ round: number; actions: (LifeChangeAction | TurnChangeAction)[] }> = []
    let currentRound = 1
    let roundActions: (LifeChangeAction | TurnChangeAction)[] = []
    let turnCount = 0

    game.actions.forEach(action => {
      if (action.type === 'turn-change') {
        turnCount++
        // Only complete the round when all players have taken their turn
        if (turnCount % game.players.length === 0) {
          // Round complete - save current round and start next
          roundActions.push(action)
          groups.push({ round: currentRound, actions: roundActions })
          currentRound++
          roundActions = []
        } else {
          // Still in current round
          roundActions.push(action)
        }
      } else {
        // Non-turn actions go to current round
        roundActions.push(action)
      }
    })

    // Add any remaining actions to the current round
    if (roundActions.length > 0) {
      groups.push({ round: currentRound, actions: roundActions })
    }

    return groups
  }

  const value: GamesContextType = {
    games,
    addGame,
    removeGame,
    updateGame,
    setGames,
    getCurrentActivePlayer,
    getCurrentRound,
    groupActionsByRound,
    dispatchAction,
    registerTurnChangeCallback,
    unregisterTurnChangeCallback,
    undoLastAction
  }

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}
