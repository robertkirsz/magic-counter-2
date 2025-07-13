import { useContext } from 'react'

import { DecksContext } from '../contexts/DecksContextDef'

export const useDecks = () => {
  const context = useContext(DecksContext)
  if (context === undefined) throw new Error('useDecks must be used within a DecksProvider')
  return context
}
