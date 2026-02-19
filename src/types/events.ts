/**
 * Typed event system for Magic Counter 2
 *
 * This module provides a type-safe way to dispatch and listen to custom events
 * throughout the application. All events are documented with their purpose and
 * expected data structure.
 */

// ============================================================================
// Event Types
// ============================================================================

/**
 * Game state change event - triggered when a game's state changes
 */
export interface GameStateChangeEvent {
  type: 'game-state-change'
  detail: {
    /** ID of the game that changed state */
    gameId: string
    /** Previous state of the game */
    previousState: 'setup' | 'active' | 'finished'
    /** New state of the game */
    newState: 'setup' | 'active' | 'finished'
  }
}

/**
 * Player turn change event - triggered when the active player changes
 */
export interface TurnChangeEvent {
  type: 'turn-change'
  detail: {
    /** ID of the game */
    gameId: string
    /** ID of the player whose turn just ended (null if game is starting) */
    fromPlayerId: string | null
    /** ID of the player whose turn is now active (null if game is ending) */
    toPlayerId: string | null
  }
}

/**
 * Life change event - triggered when a player's life total changes
 */
export interface LifeChangeEvent {
  type: 'life-change'
  detail: {
    /** ID of the game */
    gameId: string
    /** ID of the player whose life changed */
    playerId: string
    /** Previous life total */
    previousLife: number
    /** New life total */
    newLife: number
    /** Amount of life gained/lost (positive for gain, negative for loss) */
    change: number
  }
}

/**
 * Monarch change event - triggered when the monarch changes
 */
export interface MonarchChangeEvent {
  type: 'monarch-change'
  detail: {
    /** ID of the game */
    gameId: string
    /** ID of the player who was previously monarch (null if no monarch) */
    fromPlayerId: string | null
    /** ID of the player who is now monarch (null if monarch removed) */
    toPlayerId: string | null
  }
}

/**
 * Game deletion event - triggered when a game is permanently deleted
 */
export interface GameDeleteEvent {
  type: 'game-delete'
  detail: {
    /** ID of the game that was deleted */
    gameId: string
  }
}

// ============================================================================
// Event Type Guards
// ============================================================================

/**
 * Type guard to check if an event is a game state change event
 */
export function isGameStateChangeEvent(event: Event): event is CustomEvent<GameStateChangeEvent['detail']> {
  return event instanceof CustomEvent && event.type === 'game-state-change'
}

/**
 * Type guard to check if an event is a turn change event
 */
export function isTurnChangeEvent(event: Event): event is CustomEvent<TurnChangeEvent['detail']> {
  return event instanceof CustomEvent && event.type === 'turn-change'
}

/**
 * Type guard to check if an event is a life change event
 */
export function isLifeChangeEvent(event: Event): event is CustomEvent<LifeChangeEvent['detail']> {
  return event instanceof CustomEvent && event.type === 'life-change'
}

/**
 * Type guard to check if an event is a monarch change event
 */
export function isMonarchChangeEvent(event: Event): event is CustomEvent<MonarchChangeEvent['detail']> {
  return event instanceof CustomEvent && event.type === 'monarch-change'
}

/**
 * Type guard to check if an event is a game delete event
 */
export function isGameDeleteEvent(event: Event): event is CustomEvent<GameDeleteEvent['detail']> {
  return event instanceof CustomEvent && event.type === 'game-delete'
}
