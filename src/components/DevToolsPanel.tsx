import { BookOpen, Swords, Trophy, UserPlus, Wrench } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { createFinishedGame } from '../utils/gameGenerator'
import { AVAILABLE_COMMANDERS } from '../utils/scryfall'
import { Button } from './Button'

// Types for data validation
type DataType = 'users' | 'decks' | 'games'

interface DataSection {
  type: DataType
  title: string
  validator: (obj: unknown) => boolean
  errorMessage: string
}

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

// Random data generators
const RANDOM_NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
  'Iris',
  'Jack',
  'Kate',
  'Liam',
  'Maya',
  'Noah',
  'Olivia',
  'Paul',
  'Quinn',
  'Ruby',
  'Sam',
  'Tara',
  'Uma',
  'Victor',
  'Wendy',
  'Xander',
  'Yara',
  'Zoe',
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Casey',
  'Riley'
]

const generateRandomUser = (): Omit<User, 'id' | 'createdAt'> => {
  const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
  const randomNumber = Math.floor(Math.random() * 1000)
  return { name: `${randomName}${randomNumber}` }
}

const generateRandomDeck = (): Omit<Deck, 'id' | 'createdAt'> => {
  const randomNumber = Math.floor(Math.random() * 1000)
  const deckNames = ['Aggro', 'Control', 'Combo', 'Midrange', 'Tempo', 'Ramp', 'Burn', 'Tribal']
  const randomDeckName = deckNames[Math.floor(Math.random() * deckNames.length)]

  const commanderCount = Math.random() > 0.05 ? 1 : 2
  const shuffledCommanders = [...AVAILABLE_COMMANDERS].sort(() => Math.random() - 0.5)
  const selectedCommanders = shuffledCommanders.slice(0, commanderCount)

  const allColors = selectedCommanders.map(commander => commander.colors).flat()
  const uniqueColors = [...new Set(allColors)]

  return {
    name: `${randomDeckName} Deck ${randomNumber}`,
    colors: uniqueColors.length > 0 ? uniqueColors : ['C'],
    commanders: selectedCommanders,
    createdBy: null
  }
}

const generateRandomGame = (
  users: User[],
  decks: Deck[]
): Pick<Game, 'players' | 'turnTracking' | 'startingLife' | 'commanders'> => {
  const playerCount = Math.floor(Math.random() * 3) + 2
  const turnTracking = Math.random() > 0.5
  const startingLife = playerCount >= 4 ? 40 : 20
  const commanders = playerCount >= 3 && Math.random() > 0.75

  const shuffledUsers = [...users].sort(() => Math.random() - 0.5)
  const shuffledDecks = [...decks].sort(() => Math.random() - 0.5)

  const players: Player[] = []

  for (let i = 0; i < playerCount; i++) {
    const user = shuffledUsers[i] || null
    const deck = shuffledDecks[i] || null

    players.push({
      id: `player-${i + 1}`,
      userId: user?.id || null,
      deckId: deck?.id || null
    })
  }

  return { players, turnTracking, startingLife, commanders }
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
    <summary className="font-bold mb-2 cursor-pointer select-none text-slate-100">
      {section.title}
    </summary>

    <textarea
      className={cn('form-textarea resize-y mb-1 h-28', error && 'border-red-500 dark:border-red-500')}
      value={text}
      onChange={e => setText(e.target.value)}
      spellCheck={false}
    />

    {error && <div className="text-red-600 text-xs mb-1">{error}</div>}

    <Button variant="secondary" onClick={onSave}>
      Save
    </Button>
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
  <Button variant="secondary" onClick={onClick} disabled={disabled} className="flex items-center gap-1" title={title}>
    {icon}
  </Button>
)

export const DevToolsPanel: React.FC = () => {
  const { users, addUser, setUsers } = useUsers()
  const { decks, addDeck, setDecks } = useDecks()
  const { games, setGames, addGame } = useGames()
  const [open, setOpen] = useState(false)

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
      setGames(reviveDates(parsed as Game[]))
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
      setGames(reviveDates(importedGames))
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
  const handleAddRandomGame = () => {
    if (users.length === 0 || decks.length === 0) {
      alert('You need at least one user and one deck to generate a random game.')
      return
    }
    const gameData = generateRandomGame(users, decks)
    addGame(gameData)
  }
  const handleAddFinishedGame = () => {
    if (users.length === 0 || decks.length === 0) {
      alert('You need at least one user and one deck to generate a finished game.')
      return
    }
    const finishedGame = createFinishedGame(users, decks)
    setGames(prev => [...prev, finishedGame])
  }

  return (
    <div className="fixed z-100 gap-2 bottom-2 right-2 flex flex-col items-end">
      {open && (
        <div className="flex flex-col gap-2 bg-slate-900 border border-slate-700 font-mono rounded-lg p-4 shadow-lg max-h-[400px] max-w-[100%] overflow-y-auto text-xs">
          {/* Quick Actions Section */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none text-slate-100">
              Quick Actions
            </summary>

            <div className="flex flex-wrap gap-2 mb-3">
              <QuickActionButton icon={<UserPlus size={14} />} onClick={handleAddRandomUser} title="Add Random User" />
              <QuickActionButton icon={<BookOpen size={14} />} onClick={handleAddRandomDeck} title="Add Random Deck" />
              <QuickActionButton
                icon={<Swords size={14} />}
                onClick={handleAddRandomGame}
                disabled={users.length === 0 || decks.length === 0}
                title="Add Random Game"
              />
              <QuickActionButton
                icon={<Trophy size={14} />}
                onClick={handleAddFinishedGame}
                disabled={users.length === 0 || decks.length === 0}
                title="Add Finished Game"
              />
            </div>
          </details>

          {/* Import/Export Section */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none text-slate-100">
              Import/Export
            </summary>

            <div className="flex gap-2 mb-3">
              <Button variant="secondary" onClick={handleExport}>
                Export
              </Button>

              <label className="btn primary">
                Import
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <Button variant="danger" onClick={handleClearData}>
                Delete
              </Button>
            </div>

            {importError && <div className="text-red-600 text-xs mb-2">{importError}</div>}
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
        className={cn('bg-green-500 transition-all duration-200', open && 'rotate-12')}
        onClick={() => setOpen(o => !o)}
      >
        <Wrench size={20} />
      </Button>
    </div>
  )
}
