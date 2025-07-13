import { useContext } from 'react'

import { UsersContext } from '../contexts/UsersContextDef'

export const useUsers = () => {
  const context = useContext(UsersContext)
  if (context === undefined) throw new Error('useUsers must be used within a UsersProvider')
  return context
}
