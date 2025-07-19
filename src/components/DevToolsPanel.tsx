import { Wrench } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { Button } from './Button'

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

export const DevToolsPanel: React.FC = () => {
  const { users, setUsers } = useUsers()
  const { decks, setDecks } = useDecks()
  const { games, setGames } = useGames()
  const [open, setOpen] = useState(false)

  // Local state for editing
  const [usersText, setUsersText] = useState(() => JSON.stringify(users, null, 2))
  const [decksText, setDecksText] = useState(() => JSON.stringify(decks, null, 2))
  const [gamesText, setGamesText] = useState(() => JSON.stringify(games, null, 2))
  const [usersError, setUsersError] = useState<string | null>(null)
  const [decksError, setDecksError] = useState<string | null>(null)
  const [gamesError, setGamesError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Keep textareas in sync with context changes
  useEffect(() => {
    setUsersText(JSON.stringify(users, null, 2))
  }, [users])

  useEffect(() => {
    setDecksText(JSON.stringify(decks, null, 2))
  }, [decks])

  useEffect(() => {
    setGamesText(JSON.stringify(games, null, 2))
  }, [games])

  const handleSave = (type: 'users' | 'decks' | 'games') => {
    if (type === 'users') {
      const [parsed, err] = tryParseJSON(usersText)

      if (err) {
        setUsersError(err)
        return
      }

      if (!Array.isArray(parsed) || !parsed.every(isValidUser)) {
        setUsersError('Invalid user data. Each user must have id, createdAt, and name.')
        return
      }

      setUsersError(null)
      setUsers(reviveDates(parsed))
    } else if (type === 'decks') {
      const [parsed, err] = tryParseJSON(decksText)

      if (err) {
        setDecksError(err)
        return
      }

      if (!Array.isArray(parsed) || !parsed.every(isValidDeck)) {
        setDecksError('Invalid deck data. Each deck must have id, createdAt, name, and colors.')
        return
      }

      setDecksError(null)
      setDecks(reviveDates(parsed))
    } else if (type === 'games') {
      const [parsed, err] = tryParseJSON(gamesText)

      if (err) {
        setGamesError(err)
        return
      }

      if (!Array.isArray(parsed) || !parsed.every(isValidGame)) {
        setGamesError('Invalid game data. Each game must have id, createdAt, state, players, and tracking.')
        return
      }

      setGamesError(null)
      setGames(reviveDates(parsed))
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

  return (
    <div className="fixed z-20 gap-2 bottom-2 right-2 flex flex-col items-end">
      {open && (
        <div className="flex flex-col gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono rounded-lg mt-2 p-4 shadow-lg max-h-[400px] w-full overflow-y-auto text-xs">
          {/* Import/Export Section */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none">Import/Export</summary>

            <div className="flex gap-2 mb-3">
              <Button variant="secondary" onClick={handleExport}>
                Export All Data
              </Button>

              <label className="btn primary">
                Import Data
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            {importError && <div className="text-red-600 text-xs mb-2">{importError}</div>}
          </details>

          <details open>
            <summary className="font-bold mb-1 cursor-pointer select-none">Users</summary>

            <textarea
              className={`form-textarea resize-y mb-1 h-28 ${usersError ? 'border-red-500 dark:border-red-500' : ''}`}
              value={usersText}
              onChange={e => setUsersText(e.target.value)}
              spellCheck={false}
            />

            {usersError && <div className="text-red-600 text-xs mb-1">{usersError}</div>}

            <Button variant="secondary" onClick={() => handleSave('users')}>
              Save
            </Button>
          </details>

          <details open className="mt-3">
            <summary className="font-bold mb-1 cursor-pointer select-none">Decks</summary>

            <textarea
              className={`form-textarea resize-y mb-1 h-28 ${decksError ? 'border-red-500 dark:border-red-500' : ''}`}
              value={decksText}
              onChange={e => setDecksText(e.target.value)}
              spellCheck={false}
            />

            {decksError && <div className="text-red-600 text-xs mb-1">{decksError}</div>}

            <Button variant="secondary" onClick={() => handleSave('decks')}>
              Save
            </Button>
          </details>

          <details open className="mt-3">
            <summary className="font-bold mb-1 cursor-pointer select-none">Games</summary>

            <textarea
              className={`form-textarea resize-y mb-1 h-28 ${gamesError ? 'border-red-500 dark:border-red-500' : ''}`}
              value={gamesText}
              onChange={e => setGamesText(e.target.value)}
              spellCheck={false}
            />

            {gamesError && <div className="text-red-600 text-xs mb-1">{gamesError}</div>}

            <Button variant="secondary" onClick={() => handleSave('games')}>
              Save
            </Button>
          </details>
        </div>
      )}

      <Button
        variant="primary"
        round
        className={`bg-green-500 transition-all duration-200 ${open ? 'rotate-12' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <Wrench size={20} />
      </Button>
    </div>
  )
}
