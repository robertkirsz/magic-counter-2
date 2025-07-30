import React from 'react'
import type { ReactNode } from 'react'

import { useImportanceVisibility } from '../hooks/useImportanceVisibility'
import { cn } from '../utils/cn'

interface ImportanceWrapperProps {
  children: ReactNode
  importance: number
  className?: string
}

export const ImportanceWrapper: React.FC<ImportanceWrapperProps> = ({ children, importance, className = '' }) => {
  // Initialize the visibility system
  useImportanceVisibility()

  return <div className={cn(`importance-${importance}`, className)}>{children}</div>
}
