import React, { type ReactNode, createContext, useContext, useState } from 'react'

interface GamesContextType {
  games: Game[]
  addGame: (game: Omit<Game, 'id' | 'createdAt'>) => void
  removeGame: (gameId: string) => void
  updateGame: (gameId: string, updates: Partial<Game>) => void
}

const GamesContext = createContext<GamesContextType | undefined>(undefined)

interface GamesProviderProps {
  children: ReactNode
}

export const GamesProvider: React.FC<GamesProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([])

  const addGame = (gameData: Omit<Game, 'id' | 'createdAt'>) => {
    const newGame: Game = {
      ...gameData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }

    setGames(prev => [...prev, newGame])
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
    updateGame
  }

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export const useGames = (): GamesContextType => {
  const context = useContext(GamesContext)

  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider')
  }

  return context
}
