import { createContext } from 'react'

export interface GamesContextType {
  games: Game[]
  addGame: (game: Pick<Game, 'players' | 'turnTracking'>) => string
  removeGame: (gameId: string) => void
  updateGame: (gameId: string, updates: Partial<Game> | ((game: Game) => Partial<Game>)) => void
  setGames: React.Dispatch<React.SetStateAction<Game[]>>
}

export const GamesContext = createContext<GamesContextType | undefined>(undefined)
