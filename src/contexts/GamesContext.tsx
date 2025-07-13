import React, { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface GamesContextType {
  games: Game[]
  addGame: (game: Omit<Game, 'id' | 'createdAt'>) => void
  removeGame: (gameId: string) => void
  updateGame: (gameId: string, updates: Partial<Game>) => void
  setGames: React.Dispatch<React.SetStateAction<Game[]>>
}

const GamesContext = createContext<GamesContextType | undefined>(undefined)

interface GamesProviderProps {
  children: ReactNode
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
    updateGame,
    setGames
  }

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export const useGames = (): GamesContextType => {
  const context = useContext(GamesContext)
  if (context === undefined) throw new Error('useGames must be used within a GamesProvider')
  return context
}
