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
import { Button } from './Button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

type DataType = 'users' | 'decks' | 'games'

type GameType = 'untracked' | 'tracked' | 'random'
type GameState = 'setup' | 'active' | 'finished'

interface DataSection {
  type: DataType
  title: string
  validator: (obj: unknown) => boolean
  errorMessage: string
}

interface LogEntry {
  id: string
  timestamp: Date
  type: string
  data: unknown
}

const MAX_LOG_ENTRIES = 20

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

interface DataSectionProps {
  section: DataSection
  text: string
  setText: (text: string) => void
  error: string | null
  onSave: () => void
}

const DataSectionComponent: React.FC<DataSectionProps> = ({ section, text, setText, error, onSave }) => (
  <details open>
    <summary className="font-bold mb-2 cursor-pointer select-none">{section.title}</summary>

    <Textarea
      className={cn('resize-y mb-1 h-28 font-mono text-xs', error && 'border-destructive')}
      value={text}
      onChange={e => setText(e.target.value)}
      spellCheck={false}
    />

    {error && <div className="text-destructive text-xs mb-1">{error}</div>}

    <Button variant="secondary" small onClick={onSave}>
      Save
    </Button>
  </details>
)

interface QuickActionButtonProps {
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title?: string
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, onClick, disabled, title }) => (
  <Button variant="secondary" small onClick={onClick} disabled={disabled} title={title}>
    {icon}
  </Button>
)

export const DevToolsPanel: React.FC = () => {
  const { users, addUser, setUsers } = useUsers()
  const { decks, addDeck, setDecks } = useDecks()
  const { games, setGames } = useGames()
  const [open, setOpen] = useState(false)

  const [gameType, setGameType] = useState<GameType>('random')
  const [gameState, setGameState] = useState<GameState>('active')

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

  const [logs, setLogs] = useState<LogEntry[]>([])

  const createLogEntry = (type: string, event: CustomEvent<unknown>): LogEntry => ({
    id: `${type.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    timestamp: new Date(),
    type,
    data: event.detail
  })

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

  useEffect(() => {
    setTexts(prev => ({ ...prev, users: JSON.stringify(users, null, 2) }))
  }, [users])

  useEffect(() => {
    setTexts(prev => ({ ...prev, decks: JSON.stringify(decks, null, 2) }))
  }, [decks])

  useEffect(() => {
    setTexts(prev => ({ ...prev, games: JSON.stringify(games, null, 2) }))
  }, [games])

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

  const handleAddRandomDeck = () => addDeck(generateRandomDeck())

  const handleAddGame = () => {
    try {
      let gameData: Omit<Game, 'id' | 'createdAt'> | Game

      if (gameState === 'finished') {
        if (gameType === 'untracked') {
          gameData = generateFinishedGame({ users, decks, turnTracking: false })
        } else if (gameType === 'tracked') {
          gameData = generateFinishedGame({ users, decks, turnTracking: true })
        } else {
          gameData = generateFinishedGame({ users, decks })
        }
      } else {
        if (gameType === 'untracked') {
          gameData = generateRandomGame({ users, decks, turnTracking: false })
        } else if (gameType === 'tracked') {
          gameData = generateRandomGame({ users, decks, turnTracking: true })
        } else {
          gameData = generateRandomGame({ users, decks })
        }

        gameData.state = gameState
      }

      if ('id' in gameData) {
        setGames(prev => [...prev, gameData as Game])
      } else {
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
        <div className="flex flex-col gap-2 bg-card border font-mono rounded-lg p-4 shadow-lg max-h-[400px] max-w-[100%] overflow-y-auto text-xs">
          {/* Quick Actions */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none">Quick Actions</summary>

            <div className="flex flex-wrap gap-2 mb-3">
              <QuickActionButton icon={<UserPlus size={14} />} onClick={handleAddRandomUser} title="Add Random User" />
              <QuickActionButton icon={<BookOpen size={14} />} onClick={handleAddRandomDeck} title="Add Random Deck" />
            </div>

            <div className="mb-3">
              <div className="mb-2">
                <Label className="text-xs mb-1 block">Game Type:</Label>
                <div className="flex gap-2">
                  {(['untracked', 'tracked', 'random'] as GameType[]).map(type => (
                    <label key={type} className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name="gameType"
                        value={type}
                        checked={gameType === type}
                        onChange={e => setGameType(e.target.value as GameType)}
                        className="mr-1"
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <Label className="text-xs mb-1 block">Game State:</Label>
                <div className="flex gap-2">
                  {(['setup', 'active', 'finished'] as GameState[]).map(state => (
                    <label key={state} className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name="gameState"
                        value={state}
                        checked={gameState === state}
                        onChange={e => setGameState(e.target.value as GameState)}
                        className="mr-1"
                      />
                      {state.charAt(0).toUpperCase() + state.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <QuickActionButton icon={<Swords size={14} />} onClick={handleAddGame} title="Add Game" />
            </div>
          </details>

          {/* Import/Export */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none">Import/Export</summary>

            <div className="flex gap-2 mb-3">
              <Button variant="secondary" small onClick={handleExport}>
                Export
              </Button>

              <label className={cn('inline-flex items-center justify-center gap-2 rounded-md text-xs font-medium cursor-pointer h-8 px-3 bg-primary text-primary-foreground shadow hover:bg-primary/90')}>
                Import
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <Button variant="danger" small onClick={handleClearData}>
                Delete
              </Button>
            </div>

            {importError && <div className="text-destructive text-xs mb-2">{importError}</div>}
          </details>

          {/* Event Logger */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none">Event Logger</summary>

            <div className="flex gap-2 mb-3">
              <Button variant="secondary" small onClick={handleClearLogs}>
                Clear Logs
              </Button>

              <span className="text-xs text-muted-foreground flex items-center">
                {logs.length}/{MAX_LOG_ENTRIES} events
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto bg-secondary rounded p-2">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-xs">No events logged yet...</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="text-xs border-l-2 border-primary pl-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{log.type}</span>
                      <span className="text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                    </div>

                    <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap text-muted-foreground">
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

      <Button
        variant="primary"
        round
        className={cn('bg-green-500 hover:bg-green-600 transition-all duration-200', open && 'rotate-12')}
        onClick={() => setOpen(o => !o)}
      >
        <Wrench size={20} />
      </Button>
    </div>
  )
}
