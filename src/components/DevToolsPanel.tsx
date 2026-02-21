import { BookOpen, Swords, UserPlus, Wrench } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import {
  useGameDeleteListener,
  useGameStateChangeListener,
  useLifeChangeListener,
  useTurnChangeListener
} from '../utils/eventDispatcher'
import {
  generateFinishedGame,
  generateRandomDeck,
  generateRandomGame,
  generateRandomUser
} from '../utils/generateRandom'
import { generateId } from '../utils/idGenerator'
import { fetchRandomCommander } from '../utils/scryfall'

// Types for data validation
type DataType = 'users' | 'decks' | 'games'

// Game creation types
type GameType = 'untracked' | 'tracked' | 'random'
type GameState = 'setup' | 'active' | 'finished'

interface DataSection {
  type: DataType
  title: string
  validator: (obj: unknown) => boolean
  errorMessage: string
}

// Types for event logging
interface LogEntry {
  id: string
  timestamp: Date
  type: string
  data: unknown
}

// Constants
const MAX_LOG_ENTRIES = 20

// Utility functions
function tryParseJSON<T>(value: string): [T | null, string | null] {
  try {
    return [JSON.parse(value), null]
  } catch (e: unknown) {
    const error = e as Error
    return [null, error.message]
  }
}

function isValidUser(obj: unknown): obj is User {
  return (
    !!obj &&
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as User).id === 'string' &&
    'createdAt' in obj &&
    !!(obj as User).createdAt &&
    'name' in obj &&
    typeof (obj as User).name === 'string'
  )
}

function isValidDeck(obj: unknown): obj is Deck {
  return (
    !!obj &&
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Deck).id === 'string' &&
    'createdAt' in obj &&
    !!(obj as Deck).createdAt &&
    'name' in obj &&
    typeof (obj as Deck).name === 'string' &&
    'colors' in obj &&
    Array.isArray((obj as Deck).colors)
  )
}

function isValidGame(obj: unknown): obj is Game {
  return (
    !!obj &&
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Game).id === 'string' &&
    'createdAt' in obj &&
    !!(obj as Game).createdAt &&
    'state' in obj &&
    typeof (obj as Game).state === 'string' &&
    'players' in obj &&
    Array.isArray((obj as Game).players) &&
    'turnTracking' in obj
  )
}

function reviveDates<T extends { createdAt: string | Date }>(arr: T[]): T[] {
  return arr.map(obj => ({
    ...obj,
    createdAt: typeof obj.createdAt === 'string' ? DateTime.fromISO(obj.createdAt).toJSDate() : obj.createdAt
  }))
}

// Data section component
interface DataSectionProps {
  section: DataSection
  text: string
  setText: (text: string) => void
  error: string | null
  onSave: () => void
}

const DataSectionComponent: React.FC<DataSectionProps> = ({ section, text, setText, error, onSave }) => (
  <details open>
    <summary className="font-bold mb-2 cursor-pointer select-none text-base-content">{section.title}</summary>

    <textarea
      className={cn('textarea textarea-bordered w-full resize-y mb-1 h-28', error && 'border-error')}
      value={text}
      onChange={e => setText(e.target.value)}
      spellCheck={false}
    />

    {error && <div className="text-error text-xs mb-1">{error}</div>}

    <button className="btn btn-xs" onClick={onSave}>
      Save
    </button>
  </details>
)

// Quick action button component
interface QuickActionButtonProps {
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title?: string
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, onClick, disabled, title }) => (
  <button className="btn btn-xs flex items-center gap-1" onClick={onClick} disabled={disabled} title={title}>
    {icon}
  </button>
)

export const DevToolsPanel: React.FC = () => {
  const { users, addUser, setUsers } = useUsers()
  const { decks, addDeck, setDecks } = useDecks()
  const { games, setGames } = useGames()
  const [open, setOpen] = useState(false)

  // Game creation state
  const [gameType, setGameType] = useState<GameType>('random')
  const [gameState, setGameState] = useState<GameState>('active')

  // Local state for editing
  const [texts, setTexts] = useState({
    users: JSON.stringify(users, null, 2),
    decks: JSON.stringify(decks, null, 2),
    games: JSON.stringify(games, null, 2)
  })
  const [errors, setErrors] = useState<Record<DataType, string | null>>({
    users: null,
    decks: null,
    games: null
  })
  const [importError, setImportError] = useState<string | null>(null)

  // Event logging state
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Helper function to create log entries
  const createLogEntry = (type: string, event: CustomEvent<unknown>): LogEntry => ({
    id: `${type.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    timestamp: new Date(),
    type,
    data: event.detail
  })

  // Event listeners for logging
  useGameStateChangeListener(event => {
    const logEntry = createLogEntry('Game State Change', event)
    queueMicrotask(() => {
      setLogs(prev => [logEntry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)])
    })
  })

  useTurnChangeListener(event => {
    const logEntry = createLogEntry('Turn Change', event)
    queueMicrotask(() => {
      setLogs(prev => [logEntry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)])
    })
  })

  useLifeChangeListener(event => {
    const logEntry = createLogEntry('Life Change', event)
    queueMicrotask(() => {
      setLogs(prev => [logEntry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)])
    })
  })

  useGameDeleteListener(event => {
    const logEntry = createLogEntry('Game Delete', event)
    queueMicrotask(() => {
      setLogs(prev => [logEntry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)])
    })
  })

  // Keep textareas in sync with context changes
  useEffect(() => {
    setTexts(prev => ({ ...prev, users: JSON.stringify(users, null, 2) }))
  }, [users])

  useEffect(() => {
    setTexts(prev => ({ ...prev, decks: JSON.stringify(decks, null, 2) }))
  }, [decks])

  useEffect(() => {
    setTexts(prev => ({ ...prev, games: JSON.stringify(games, null, 2) }))
  }, [games])

  // Data sections configuration
  const dataSections: DataSection[] = [
    {
      type: 'users',
      title: 'Users',
      validator: isValidUser,
      errorMessage: 'Invalid user data. Each user must have id, createdAt, and name.'
    },
    {
      type: 'decks',
      title: 'Decks',
      validator: isValidDeck,
      errorMessage: 'Invalid deck data. Each deck must have id, createdAt, name, and colors.'
    },
    {
      type: 'games',
      title: 'Games',
      validator: isValidGame,
      errorMessage: 'Invalid game data. Each game must have id, createdAt, state, players, and tracking.'
    }
  ]

  const handleSave = (type: DataType) => {
    const section = dataSections.find(s => s.type === type)
    if (!section) return

    const text = texts[type]
    const [parsed, err] = tryParseJSON(text)

    if (err) {
      setErrors(prev => ({ ...prev, [type]: err }))
      return
    }

    if (!Array.isArray(parsed) || !parsed.every(section.validator)) {
      setErrors(prev => ({ ...prev, [type]: section.errorMessage }))
      return
    }

    setErrors(prev => ({ ...prev, [type]: null }))

    // Apply the data based on type
    if (type === 'users') {
      setUsers(reviveDates(parsed as User[]))
    } else if (type === 'decks') {
      setDecks(reviveDates(parsed as Deck[]))
    } else if (type === 'games') {
      setGames(
        reviveDates(parsed as Game[]).map(game => ({
          ...game,
          actions: game.actions.map(action => ({
            ...action,
            createdAt:
              typeof action.createdAt === 'string' ? DateTime.fromISO(action.createdAt).toJSDate() : action.createdAt
          }))
        }))
      )
    }
  }

  const handleExport = () => {
    const appData = {
      users,
      decks,
      games,
      exportedAt: DateTime.now().toISO()
    }

    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `magic-counter-data-${DateTime.now().toFormat('yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      const [parsed, err] = tryParseJSON(content)

      if (err) {
        setImportError(`Invalid JSON: ${err}`)
        return
      }

      if (!parsed || typeof parsed !== 'object') {
        setImportError('Invalid data format')
        return
      }

      const {
        users: importedUsers,
        decks: importedDecks,
        games: importedGames
      } = parsed as {
        users: unknown[]
        decks: unknown[]
        games: unknown[]
      }

      // Validate imported data
      if (!Array.isArray(importedUsers) || !importedUsers.every(isValidUser)) {
        setImportError('Invalid users data in imported file')
        return
      }

      if (!Array.isArray(importedDecks) || !importedDecks.every(isValidDeck)) {
        setImportError('Invalid decks data in imported file')
        return
      }

      if (!Array.isArray(importedGames) || !importedGames.every(isValidGame)) {
        setImportError('Invalid games data in imported file')
        return
      }

      // Apply imported data
      setUsers(reviveDates(importedUsers))
      setDecks(reviveDates(importedDecks))
      setGames(
        reviveDates(importedGames).map(game => ({
          ...game,
          actions: game.actions.map(action => ({
            ...action,
            createdAt:
              typeof action.createdAt === 'string' ? DateTime.fromISO(action.createdAt).toJSDate() : action.createdAt
          }))
        }))
      )
      setImportError(null)
    }

    reader.readAsText(file)
  }

  const handleClearData = () => {
    const confirmed = window.confirm('Are you sure you want to delete all data? This action cannot be undone.')

    if (confirmed) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const handleAddRandomUser = () => addUser(generateRandomUser())

  const handleAddRandomDeck = async () => {
    // Randomly decide if we should add commanders (70% chance)
    const shouldAddCommanders = Math.random() > 0.3

    if (shouldAddCommanders) {
      try {
        // Fetch 1-2 random commanders (Commander format allows up to 2)
        const commanderCount = Math.random() > 0.7 ? 2 : 1
        const commanders: ScryfallCard[] = []

        for (let i = 0; i < commanderCount; i++) {
          const commander = await fetchRandomCommander()
          if (commander) {
            commanders.push(commander)
          }
        }

        // Only add deck if we got at least one commander, or if we're not trying to add commanders
        if (commanders.length > 0) {
          addDeck(generateRandomDeck({ commanders }))
        } else {
          // Fallback: add deck without commanders if API fails
          addDeck(generateRandomDeck())
        }
      } catch (error) {
        console.error('Error fetching random commanders:', error)
        // Fallback: add deck without commanders if API fails
        addDeck(generateRandomDeck())
      }
    } else {
      // Add deck without commanders
      addDeck(generateRandomDeck())
    }
  }

  const handleAddGame = () => {
    try {
      let gameData: Omit<Game, 'id' | 'createdAt'> | Game

      if (gameState === 'finished') {
        // For finished games, use generateFinishedGame which creates proper actions
        if (gameType === 'untracked') {
          gameData = generateFinishedGame({ users, decks, turnTracking: false })
        } else if (gameType === 'tracked') {
          gameData = generateFinishedGame({ users, decks, turnTracking: true })
        } else {
          // For 'random' type, let the generator decide randomly
          gameData = generateFinishedGame({ users, decks })
        }
      } else {
        // For setup and active games, use generateRandomGame
        if (gameType === 'untracked') {
          // Force untracked game
          gameData = generateRandomGame({ users, decks, turnTracking: false })
        } else if (gameType === 'tracked') {
          // Force tracked game
          gameData = generateRandomGame({ users, decks, turnTracking: true })
        } else {
          // For 'random' type, let the generator decide randomly
          gameData = generateRandomGame({ users, decks })
        }

        // Set the game state
        gameData.state = gameState
      }

      // Use setGames directly to preserve the state we want to set
      if ('id' in gameData) {
        // gameData is already a complete Game (from generateFinishedGame)
        setGames(prev => [...prev, gameData as Game])
      } else {
        // gameData is Omit<Game, 'id' | 'createdAt'> (from generateRandomGame)
        setGames(prev => [
          ...prev,
          {
            ...gameData,
            id: generateId(),
            createdAt: DateTime.now().toJSDate(),
            activePlayerId: null,
            actions: []
          }
        ])
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate game')
    }
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  return (
    <div className="fixed z-100 gap-2 bottom-2 right-2 flex flex-col items-end">
      {open && (
        <div className="flex flex-col gap-2 bg-base-300 border border-base-300 font-mono rounded-lg p-4 shadow-lg max-h-[400px] max-w-full overflow-y-auto text-xs">
          {/* Quick Actions Section */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none text-base-content">Quick Actions</summary>

            <div className="flex flex-wrap gap-2 mb-3">
              <QuickActionButton icon={<UserPlus size={14} />} onClick={handleAddRandomUser} title="Add Random User" />
              <QuickActionButton icon={<BookOpen size={14} />} onClick={handleAddRandomDeck} title="Add Random Deck" />
            </div>

            {/* Game Creation Controls */}
            <div className="mb-3">
              <div className="mb-2">
                <label className="text-xs text-base-content/80 mb-1 block">Game Type:</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="gameType"
                      value="untracked"
                      checked={gameType === 'untracked'}
                      onChange={e => setGameType(e.target.value as GameType)}
                      className="mr-1"
                    />
                    Untracked
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="gameType"
                      value="tracked"
                      checked={gameType === 'tracked'}
                      onChange={e => setGameType(e.target.value as GameType)}
                      className="mr-1"
                    />
                    Tracked
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="gameType"
                      value="random"
                      checked={gameType === 'random'}
                      onChange={e => setGameType(e.target.value as GameType)}
                      className="mr-1"
                    />
                    Random
                  </label>
                </div>
              </div>

              <div className="mb-2">
                <label className="text-xs text-base-content/80 mb-1 block">Game State:</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="gameState"
                      value="setup"
                      checked={gameState === 'setup'}
                      onChange={e => setGameState(e.target.value as GameState)}
                      className="mr-1"
                    />
                    Setup
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="gameState"
                      value="active"
                      checked={gameState === 'active'}
                      onChange={e => setGameState(e.target.value as GameState)}
                      className="mr-1"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="gameState"
                      value="finished"
                      checked={gameState === 'finished'}
                      onChange={e => setGameState(e.target.value as GameState)}
                      className="mr-1"
                    />
                    Finished
                  </label>
                </div>
              </div>

              <QuickActionButton icon={<Swords size={14} />} onClick={handleAddGame} title="Add Game" />
            </div>
          </details>

          {/* Import/Export Section */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none text-base-content">Import/Export</summary>

            <div className="flex gap-2 mb-3">
              <button className="btn btn-xs" onClick={handleExport}>
                Export
              </button>

              <label className="btn btn-xs btn-primary">
                Import
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <button className="btn btn-xs btn-error" onClick={handleClearData}>
                Delete
              </button>
            </div>

            {importError && <div className="text-error text-xs mb-2">{importError}</div>}
          </details>

          {/* Event Logger Section */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none text-base-content">Event Logger</summary>

            <div className="flex gap-2 mb-3">
              <button className="btn btn-xs" onClick={handleClearLogs}>
                Clear Logs
              </button>

              <span className="text-xs text-base-content/70 flex items-center">
                {logs.length}/{MAX_LOG_ENTRIES} events
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto bg-base-200 rounded p-2">
              {logs.length === 0 ? (
                <p className="text-base-content/70 text-xs">No events logged yet...</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="text-xs border-l-2 border-info pl-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-base-content/90">{log.type}</span>
                      <span className="text-base-content/70">{log.timestamp.toLocaleTimeString()}</span>
                    </div>

                    <pre className="text-base-content/80 mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </details>

          {/* Data Sections */}
          {dataSections.map(section => (
            <DataSectionComponent
              key={section.type}
              section={section}
              text={texts[section.type]}
              setText={text => setTexts(prev => ({ ...prev, [section.type]: text }))}
              error={errors[section.type]}
              onSave={() => handleSave(section.type)}
            />
          ))}
        </div>
      )}

      <button
        className={cn('btn btn-primary btn-circle transition-all duration-200', open && 'rotate-45')}
        onClick={() => setOpen(o => !o)}
      >
        <Wrench size={20} />
      </button>
    </div>
  )
}
