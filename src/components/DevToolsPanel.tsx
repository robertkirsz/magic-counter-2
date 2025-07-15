import { Wrench } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'

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
    createdAt: typeof obj.createdAt === 'string' ? new Date(obj.createdAt) : obj.createdAt
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
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `magic-counter-data-${new Date().toISOString().split('T')[0]}.json`
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
        <div className="flex flex-col gap-2 bg-white border border-gray-200 font-mono rounded-lg mt-2 p-4 shadow-lg max-h-[400px] w-full overflow-y-auto text-xs">
          {/* Import/Export Section */}
          <details open>
            <summary className="font-bold mb-2 cursor-pointer select-none">Import/Export</summary>

            <div className="flex gap-2 mb-3">
              <button
                className="bg-green-600 text-white rounded px-2 py-1 text-xs font-semibold hover:bg-green-700 transition"
                onClick={handleExport}
              >
                Export All Data
              </button>

              <label className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-semibold hover:bg-blue-700 transition cursor-pointer">
                Import Data
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            {importError && <div className="text-red-600 text-xs mb-2">{importError}</div>}
          </details>

          <details open>
            <summary className="font-bold mb-1 cursor-pointer select-none">Users</summary>

            <textarea
              className={`bg-gray-100 p-2 rounded mb-1 w-full h-28 resize-vertical border ${usersError ? 'border-red-500' : 'border-gray-200'} focus:outline-none`}
              value={usersText}
              onChange={e => setUsersText(e.target.value)}
              spellCheck={false}
            />

            {usersError && <div className="text-red-600 text-xs mb-1">{usersError}</div>}

            <button
              className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-semibold hover:bg-blue-700 transition mb-2"
              onClick={() => handleSave('users')}
            >
              Save
            </button>
          </details>

          <details open className="mt-3">
            <summary className="font-bold mb-1 cursor-pointer select-none">Decks</summary>

            <textarea
              className={`bg-gray-100 p-2 rounded mb-1 w-full h-28 resize-vertical border ${decksError ? 'border-red-500' : 'border-gray-200'} focus:outline-none`}
              value={decksText}
              onChange={e => setDecksText(e.target.value)}
              spellCheck={false}
            />

            {decksError && <div className="text-red-600 text-xs mb-1">{decksError}</div>}

            <button
              className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-semibold hover:bg-blue-700 transition mb-2"
              onClick={() => handleSave('decks')}
            >
              Save
            </button>
          </details>

          <details open className="mt-3">
            <summary className="font-bold mb-1 cursor-pointer select-none">Games</summary>

            <textarea
              className={`bg-gray-100 p-2 rounded mb-1 w-full h-28 resize-vertical border ${gamesError ? 'border-red-500' : 'border-gray-200'} focus:outline-none`}
              value={gamesText}
              onChange={e => setGamesText(e.target.value)}
              spellCheck={false}
            />

            {gamesError && <div className="text-red-600 text-xs mb-1">{gamesError}</div>}

            <button
              className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-semibold hover:bg-blue-700 transition mb-2"
              onClick={() => handleSave('games')}
            >
              Save
            </button>
          </details>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className={`w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center ${
          open ? 'rotate-12' : ''
        }`}
        title={open ? 'Hide DevTools' : 'Show DevTools'}
      >
        <Wrench size={20} />
      </button>
    </div>
  )
}
