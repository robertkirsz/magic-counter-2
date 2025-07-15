import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { GamesContext, type GamesContextType } from './GamesContextDef'

interface GamesProviderProps {
  children: React.ReactNode
}

const LOCAL_STORAGE_KEY = 'games'

const readGames = (): Game[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) return JSON.parse(stored).map((g: Game) => ({ ...g, createdAt: new Date(g.createdAt) }))
  return []
}

export const GamesProvider: React.FC<GamesProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>(readGames())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games)), [games])

  const addGame: GamesContextType['addGame'] = gameData => {
    const newGame: Game = {
      ...gameData,
      id: uuidv4(),
      createdAt: new Date(),
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

  const latestActiveGame = games.filter(g => g.state === 'active').pop()

  const getCurrentActivePlayer = (gameId?: string): string | null => {
    const game = games.find(g => g.id === gameId) || latestActiveGame

    if (!game) return null

    if (game.state !== 'active') return null

    const lastTurn = [...game.actions].reverse().find(a => a.type === 'turn-change') as TurnChangeAction | undefined

    if (!lastTurn) return null

    return lastTurn.to
  }

  const value: GamesContextType = {
    games,
    addGame,
    removeGame,
    updateGame,
    setGames,
    getCurrentActivePlayer
  }

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}
