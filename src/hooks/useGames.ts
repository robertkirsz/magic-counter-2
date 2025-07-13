import { useContext } from 'react'

import { GamesContext } from '../contexts/GamesContextDef'

export const useGames = () => {
  const context = useContext(GamesContext)
  if (context === undefined) throw new Error('useGames must be used within a GamesProvider')
  return context
}
