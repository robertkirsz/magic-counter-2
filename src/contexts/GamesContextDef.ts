import { createContext } from 'react'

export interface GamesContextType {
  games: Game[]
  addGame: (game: Pick<Game, 'players' | 'turnTracking'>) => string
  removeGame: (gameId: string) => void
  updateGame: (gameId: string, updates: Partial<Game> | ((game: Game) => Partial<Game>)) => void
  setGames: React.Dispatch<React.SetStateAction<Game[]>>
  getCurrentActivePlayer: (gameId?: Game['id']) => string | undefined
  getCurrentRound: (gameId: string) => number
  groupActionsByRound: (gameId: string) => Array<{ round: number; actions: (LifeChangeAction | TurnChangeAction)[] }>
  dispatchAction: (gameId: string, action: LifeChangeAction | TurnChangeAction) => void
  registerTurnChangeCallback: (gameId: string, callback: () => void) => void
  unregisterTurnChangeCallback: (gameId: string, callback: () => void) => void
  undoLastAction: (gameId: string) => void
}

export const GamesContext = createContext<GamesContextType | undefined>(undefined)
