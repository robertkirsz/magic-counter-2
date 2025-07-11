import React, { useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { useGames } from '../contexts/GamesContext'
import { useUsers } from '../contexts/UsersContext'

function tryParseJSON<T>(value: string): [T | null, string | null] {
  try {
    return [JSON.parse(value), null]
  } catch (e: any) {
    return [null, e.message]
  }
}

// Validation helpers
function isValidUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && obj.createdAt && typeof obj.name === 'string'
}
function isValidDeck(obj: any): obj is Deck {
  return obj && typeof obj.id === 'string' && obj.createdAt && typeof obj.name === 'string' && Array.isArray(obj.colors)
}
function isValidGame(obj: any): obj is Game {
  return (
    obj &&
    typeof obj.id === 'string' &&
    obj.createdAt &&
    typeof obj.state === 'string' &&
    Array.isArray(obj.players) &&
    'tracking' in obj
  )
}
function reviveDates<T extends { createdAt: any }>(arr: T[]): T[] {
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

  // Keep textareas in sync with context changes
  React.useEffect(() => {
    setUsersText(JSON.stringify(users, null, 2))
  }, [users])
  React.useEffect(() => {
    setDecksText(JSON.stringify(decks, null, 2))
  }, [decks])
  React.useEffect(() => {
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

  return (
    <div className="fixed bottom-5 right-5 z-50 min-w-[320px] max-w-md font-mono">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 font-semibold text-base shadow-md hover:bg-gray-800 transition-colors"
      >
        {open ? 'Hide DevTools ▲' : 'Show DevTools ▼'}
      </button>
      {open && (
        <div className="bg-white border border-gray-200 rounded-lg mt-2 p-4 shadow-lg max-h-[400px] overflow-y-auto text-xs">
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
    </div>
  )
}
