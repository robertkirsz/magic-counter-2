/**
 * Typed Event Dispatcher API
 *
 * Provides a type-safe way to dispatch and listen to custom events throughout
 * the application. This API ensures that events are properly typed and documented.
 */
// ============================================================================
// React Hook for Event Listening
// ============================================================================
import { useEffect, useRef } from 'react'

import {
  type GameDeleteEvent,
  type GameStateChangeEvent,
  type LifeChangeEvent,
  type MonarchChangeEvent,
  type SwordAttackEvent,
  type TurnChangeEvent,
  isGameDeleteEvent,
  isGameStateChangeEvent,
  isLifeChangeEvent,
  isMonarchChangeEvent,
  isSwordAttackEvent,
  isTurnChangeEvent
} from '../types/events'

// Event Dispatcher Class

/**
 * Typed event dispatcher that provides type-safe methods for dispatching
 * and listening to application events.
 */
export class EventDispatcher {
  /**
   * Dispatch a sword attack event
   * @param attackerId - ID of the player initiating the attack
   * @param targetId - ID of the player being attacked
   */
  static dispatchSwordAttack(attackerId: string, targetId: string): void {
    const event = new CustomEvent<SwordAttackEvent['detail']>('sword-attack', {
      detail: { attackerId, targetId }
    })
    window.dispatchEvent(event)
  }

  /**
   * Dispatch a game state change event
   * @param gameId - ID of the game that changed state
   * @param previousState - Previous state of the game
   * @param newState - New state of the game
   */
  static dispatchGameStateChange(
    gameId: string,
    previousState: 'setup' | 'active' | 'finished',
    newState: 'setup' | 'active' | 'finished'
  ): void {
    const event = new CustomEvent<GameStateChangeEvent['detail']>('game-state-change', {
      detail: { gameId, previousState, newState }
    })
    window.dispatchEvent(event)
  }

  /**
   * Dispatch a turn change event
   * @param gameId - ID of the game
   * @param fromPlayerId - ID of the player whose turn just ended (null if game is starting)
   * @param toPlayerId - ID of the player whose turn is now active (null if game is ending)
   */
  static dispatchTurnChange(gameId: string, fromPlayerId: string | null, toPlayerId: string | null): void {
    const event = new CustomEvent<TurnChangeEvent['detail']>('turn-change', {
      detail: { gameId, fromPlayerId, toPlayerId }
    })
    window.dispatchEvent(event)
  }

  /**
   * Dispatch a life change event
   * @param gameId - ID of the game
   * @param playerId - ID of the player whose life changed
   * @param previousLife - Previous life total
   * @param newLife - New life total
   * @param change - Amount of life gained/lost (positive for gain, negative for loss)
   */
  static dispatchLifeChange(
    gameId: string,
    playerId: string,
    previousLife: number,
    newLife: number,
    change: number
  ): void {
    const event = new CustomEvent<LifeChangeEvent['detail']>('life-change', {
      detail: { gameId, playerId, previousLife, newLife, change }
    })
    window.dispatchEvent(event)
  }

  /**
   * Dispatch a monarch change event
   * @param gameId - ID of the game
   * @param fromPlayerId - ID of the player who was previously monarch (null if no monarch)
   * @param toPlayerId - ID of the player who is now monarch (null if monarch removed)
   */
  static dispatchMonarchChange(gameId: string, fromPlayerId: string | null, toPlayerId: string | null): void {
    const event = new CustomEvent<MonarchChangeEvent['detail']>('monarch-change', {
      detail: { gameId, fromPlayerId, toPlayerId }
    })
    window.dispatchEvent(event)
  }

  /**
   * Dispatch a game delete event
   * @param gameId - ID of the game that was deleted
   */
  static dispatchGameDelete(gameId: string): void {
    const event = new CustomEvent<GameDeleteEvent['detail']>('game-delete', {
      detail: { gameId }
    })
    window.dispatchEvent(event)
  }
}

// ============================================================================
// Event Listener Utilities
// ============================================================================

/**
 * Type-safe event listener options
 */
export interface EventListenerOptions {
  /** Whether the listener should be removed after first execution */
  once?: boolean
  /** Whether the listener should capture events in the capture phase */
  capture?: boolean
  /** Whether the listener should be passive */
  passive?: boolean
}

/**
 * Add a typed event listener for sword attack events
 * @param callback - Function to call when a sword attack event occurs
 * @param options - Optional listener options
 * @returns Function to remove the event listener
 */
export function addSwordAttackListener(
  callback: (event: CustomEvent<SwordAttackEvent['detail']>) => void,
  options?: EventListenerOptions
): () => void {
  const handler = (event: Event) => {
    if (isSwordAttackEvent(event)) {
      callback(event)
    }
  }

  window.addEventListener('sword-attack', handler, options)
  return () => window.removeEventListener('sword-attack', handler, options)
}

/**
 * Add a typed event listener for game state change events
 * @param callback - Function to call when a game state change event occurs
 * @param options - Optional listener options
 * @returns Function to remove the event listener
 */
export function addGameStateChangeListener(
  callback: (event: CustomEvent<GameStateChangeEvent['detail']>) => void,
  options?: EventListenerOptions
): () => void {
  const handler = (event: Event) => {
    if (isGameStateChangeEvent(event)) {
      callback(event)
    }
  }

  window.addEventListener('game-state-change', handler, options)
  return () => window.removeEventListener('game-state-change', handler, options)
}

/**
 * Add a typed event listener for turn change events
 * @param callback - Function to call when a turn change event occurs
 * @param options - Optional listener options
 * @returns Function to remove the event listener
 */
export function addTurnChangeListener(
  callback: (event: CustomEvent<TurnChangeEvent['detail']>) => void,
  options?: EventListenerOptions
): () => void {
  const handler = (event: Event) => {
    if (isTurnChangeEvent(event)) {
      callback(event)
    }
  }

  window.addEventListener('turn-change', handler, options)
  return () => window.removeEventListener('turn-change', handler, options)
}

/**
 * Add a typed event listener for life change events
 * @param callback - Function to call when a life change event occurs
 * @param options - Optional listener options
 * @returns Function to remove the event listener
 */
export function addLifeChangeListener(
  callback: (event: CustomEvent<LifeChangeEvent['detail']>) => void,
  options?: EventListenerOptions
): () => void {
  const handler = (event: Event) => {
    if (isLifeChangeEvent(event)) {
      callback(event)
    }
  }

  window.addEventListener('life-change', handler, options)
  return () => window.removeEventListener('life-change', handler, options)
}

/**
 * Add a typed event listener for monarch change events
 * @param callback - Function to call when a monarch change event occurs
 * @param options - Optional listener options
 * @returns Function to remove the event listener
 */
export function addMonarchChangeListener(
  callback: (event: CustomEvent<MonarchChangeEvent['detail']>) => void,
  options?: EventListenerOptions
): () => void {
  const handler = (event: Event) => {
    if (isMonarchChangeEvent(event)) {
      callback(event)
    }
  }

  window.addEventListener('monarch-change', handler, options)
  return () => window.removeEventListener('monarch-change', handler, options)
}

/**
 * Add a typed event listener for game delete events
 * @param callback - Function to call when a game delete event occurs
 * @param options - Optional listener options
 * @returns Function to remove the event listener
 */
export function addGameDeleteListener(
  callback: (event: CustomEvent<GameDeleteEvent['detail']>) => void,
  options?: EventListenerOptions
): () => void {
  const handler = (event: Event) => {
    if (isGameDeleteEvent(event)) {
      callback(event)
    }
  }

  window.addEventListener('game-delete', handler, options)
  return () => window.removeEventListener('game-delete', handler, options)
}

// ============================================================================

// ============================================================================

/**
 * React hook for listening to sword attack events
 * @param callback - Function to call when a sword attack event occurs
 * @param deps - Dependencies array for the callback
 */
export function useSwordAttackListener(
  callback: (event: CustomEvent<SwordAttackEvent['detail']>) => void,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handler = (event: Event) => {
      if (isSwordAttackEvent(event)) {
        callbackRef.current(event)
      }
    }

    window.addEventListener('sword-attack', handler)
    return () => window.removeEventListener('sword-attack', handler)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * React hook for listening to game state change events
 * @param callback - Function to call when a game state change event occurs
 * @param deps - Dependencies array for the callback
 */
export function useGameStateChangeListener(
  callback: (event: CustomEvent<GameStateChangeEvent['detail']>) => void,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handler = (event: Event) => {
      if (isGameStateChangeEvent(event)) {
        callbackRef.current(event)
      }
    }

    window.addEventListener('game-state-change', handler)
    return () => window.removeEventListener('game-state-change', handler)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * React hook for listening to turn change events
 * @param callback - Function to call when a turn change event occurs
 * @param deps - Dependencies array for the callback
 */
export function useTurnChangeListener(
  callback: (event: CustomEvent<TurnChangeEvent['detail']>) => void,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handler = (event: Event) => {
      if (isTurnChangeEvent(event)) {
        callbackRef.current(event)
      }
    }

    window.addEventListener('turn-change', handler)
    return () => window.removeEventListener('turn-change', handler)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * React hook for listening to life change events
 * @param callback - Function to call when a life change event occurs
 * @param deps - Dependencies array for the callback
 */
export function useLifeChangeListener(
  callback: (event: CustomEvent<LifeChangeEvent['detail']>) => void,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handler = (event: Event) => {
      if (isLifeChangeEvent(event)) {
        callbackRef.current(event)
      }
    }

    window.addEventListener('life-change', handler)
    return () => window.removeEventListener('life-change', handler)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * React hook for listening to monarch change events
 * @param callback - Function to call when a monarch change event occurs
 * @param deps - Dependencies array for the callback
 */
export function useMonarchChangeListener(
  callback: (event: CustomEvent<MonarchChangeEvent['detail']>) => void,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handler = (event: Event) => {
      if (isMonarchChangeEvent(event)) {
        callbackRef.current(event)
      }
    }

    window.addEventListener('monarch-change', handler)
    return () => window.removeEventListener('monarch-change', handler)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * React hook for listening to game delete events
 * @param callback - Function to call when a game delete event occurs
 * @param deps - Dependencies array for the callback
 */
export function useGameDeleteListener(
  callback: (event: CustomEvent<GameDeleteEvent['detail']>) => void,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handler = (event: Event) => {
      if (isGameDeleteEvent(event)) {
        callbackRef.current(event)
      }
    }

    window.addEventListener('game-delete', handler)
    return () => window.removeEventListener('game-delete', handler)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}
