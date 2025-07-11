import { useEffect } from 'react'

import { useImportance } from './useImportance'

export const useImportanceVisibility = () => {
  const { importance } = useImportance()

  useEffect(() => {
    // Remove all hidden-importance classes first
    document.querySelectorAll('.hidden-importance').forEach(element => {
      element.classList.remove('hidden-importance')
    })

    // Add hidden-importance class to elements with importance lower than current setting
    for (let i = 1; i < importance; i++) {
      document.querySelectorAll(`.importance-${i}`).forEach(element => {
        element.classList.add('hidden-importance')
      })
    }
  }, [importance])
}
