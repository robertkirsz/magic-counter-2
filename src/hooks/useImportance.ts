import { useContext } from 'react'

import { ImportanceContext } from '../contexts/ImportanceContextDef'

export const useImportance = () => {
  const context = useContext(ImportanceContext)

  if (context === undefined) {
    throw new Error('useImportance must be used within an ImportanceProvider')
  }

  return context
}
