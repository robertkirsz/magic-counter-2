import React, { useState } from 'react'
import type { ReactNode } from 'react'

import { ImportanceContext } from './ImportanceContextDef'

interface ImportanceProviderProps {
  children: ReactNode
}

export const ImportanceProvider: React.FC<ImportanceProviderProps> = ({ children }) => {
  const [importance, setImportance] = useState(1)

  return <ImportanceContext.Provider value={{ importance, setImportance }}>{children}</ImportanceContext.Provider>
}
