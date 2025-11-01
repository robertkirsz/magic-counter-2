import { createContext } from 'react'

export interface GamesContextType {
  games: Game[]
  addGame: (game: Pick<Game, 'players' | 'turnTracking' | 'startingLife' | 'commanders'>) => string
  removeGame: (gameId: string) => void
  updateGame: (gameId: string, updates: Partial<Game> | ((game: Game) => Partial<Game>)) => void
  setGames: React.Dispatch<React.SetStateAction<Game[]>>
  getCurrentActivePlayer: (gameId?: Game['id']) => string | undefined
  getEffectiveActivePlayer: (gameId?: Game['id']) => string | undefined
  getCurrentRound: (gameId: string) => number
  groupActionsByRound: (
    gameId: string
  ) => Array<{ round: number; actions: (LifeChangeAction | TurnChangeAction | MonarchChangeAction)[] }>
  dispatchAction: (gameId: string, action: LifeChangeAction | TurnChangeAction | MonarchChangeAction) => void
  undoLastAction: (gameId: string) => void
  setEffectiveActivePlayer: (gameId: string, playerId: User['id'] | null) => void
  hasEffectiveActivePlayer: (gameId: string) => boolean
}

export const GamesContext = createContext<GamesContextType | undefined>(undefined)
