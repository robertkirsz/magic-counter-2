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
      activePlayer: null
    }

    setGames(prev => [...prev, newGame])

    return newGame.id
  }

  const removeGame = (gameId: string) => {
    setGames(prev => prev.filter(game => game.id !== gameId))
  }

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    setGames(prev => prev.map(game => (game.id === gameId ? { ...game, ...updates } : game)))
  }

  const value: GamesContextType = {
    games,
    addGame,
    removeGame,
    updateGame,
    setGames
  }

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}
