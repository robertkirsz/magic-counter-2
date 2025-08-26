# Typed Event System

This directory contains a comprehensive, type-safe event system for the Magic Counter 2 application.

## Overview

The event system provides:

- **Type-safe event dispatching** - All events are fully typed with TypeScript
- **Documented events** - Each event has clear documentation of its purpose and data structure
- **React hooks** - Easy-to-use hooks for listening to events in React components
- **Event type guards** - Runtime type checking for events
- **Centralized event management** - All events are defined in one place

## Files

- `../types/events.ts` - Event type definitions and type guards
- `eventDispatcher.ts` - Event dispatcher API and React hooks

## Usage

### Dispatching Events

```typescript
import { EventDispatcher } from '../utils/eventDispatcher'

// Dispatch a game state change event
EventDispatcher.dispatchGameStateChange('game1', 'setup', 'active')

// Dispatch a turn change event
EventDispatcher.dispatchTurnChange('game1', 'player1', 'player2')

// Dispatch a life change event
EventDispatcher.dispatchLifeChange('game1', 'player1', 20, 18, -2)

// Dispatch a game delete event
EventDispatcher.dispatchGameDelete('game1')
```

### Listening to Events in React Components

```typescript
import { useGameStateChangeListener } from '../utils/eventDispatcher'

function MyComponent() {
  useGameStateChangeListener((event) => {
    const { gameId, previousState, newState } = event.detail
    console.log(`Game ${gameId} changed from ${previousState} to ${newState}`)
  })

  return <div>Listening to game state changes...</div>
}
```

### Available Event Listeners

- `useGameStateChangeListener` - Listen to game state changes
- `useTurnChangeListener` - Listen to turn changes
- `useLifeChangeListener` - Listen to life changes
- `useMonarchChangeListener` - Listen to monarch changes
- `useGameDeleteListener` - Listen to game deletions

### Event Types

#### GameStateChangeEvent

Triggered when a game's state changes (setup → active → finished).

```typescript
{
  type: 'game-state-change'
  detail: {
    gameId: string // ID of the game that changed state
    previousState: 'setup' | 'active' | 'finished'
    newState: 'setup' | 'active' | 'finished'
  }
}
```

#### TurnChangeEvent

Triggered when the active player changes.

```typescript
{
  type: 'turn-change'
  detail: {
    gameId: string // ID of the game
    fromPlayerId: string | null // ID of the player whose turn just ended
    toPlayerId: string | null // ID of the player whose turn is now active
  }
}
```

#### LifeChangeEvent

Triggered when a player's life total changes.

```typescript
{
  type: 'life-change'
  detail: {
    gameId: string // ID of the game
    playerId: string // ID of the player whose life changed
    previousLife: number // Previous life total
    newLife: number // New life total
    change: number // Amount of life gained/lost
  }
}
```

#### GameDeleteEvent

Triggered when a game is permanently deleted.

```typescript
{
  type: 'game-delete'
  detail: {
    gameId: string // ID of the game that was deleted
  }
}
```

## Benefits

1. **Type Safety** - All events are fully typed, preventing runtime errors
2. **Documentation** - Each event is clearly documented with its purpose and data structure
3. **Consistency** - All events follow the same pattern and structure
4. **Maintainability** - Events are centralized and easy to modify
5. **Developer Experience** - IDE autocomplete and type checking for all events
6. **Debugging** - Events can be easily logged and traced

## Example: Event Logger Component

See `../components/EventLogger.tsx` for a complete example of how to use the event system. This component demonstrates listening to all events and logging them for debugging purposes.
