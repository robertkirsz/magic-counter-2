import { createContext } from 'react'

export interface ImportanceContextType {
  importance: number
  setImportance: (value: number) => void
}

export const ImportanceContext = createContext<ImportanceContextType | undefined>(undefined)
