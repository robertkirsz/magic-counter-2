import { useContext, useEffect, useRef } from 'react'

import { GamesContext } from '../contexts/GamesContextDef'

export const useGames = () => {
  const context = useContext(GamesContext)
  if (!context) throw new Error('useGames must be used within GamesProvider')
  return context
}

export const useTurnChange = (gameId: string, callback: () => void) => {
  const { registerTurnChangeCallback, unregisterTurnChangeCallback } = useGames()
  const callbackRef = useRef(callback)

  // Update the ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const stableCallback = () => callbackRef.current()

    // Register the callback
    registerTurnChangeCallback(gameId, stableCallback)

    // Cleanup: unregister the callback when component unmounts or dependencies change
    return () => {
      unregisterTurnChangeCallback(gameId, stableCallback)
    }
  }, [gameId, registerTurnChangeCallback, unregisterTurnChangeCallback])
}
