import { Play, Plus, Settings, X } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { useGames } from '../contexts/GamesContext'
import { useUsers } from '../contexts/UsersContext'
import { Deck } from './Deck'
import { Modal } from './Modal'

interface BoardProps {
  game: Game
}

interface PlayerSection {
  id: string
  userId: string | null
  deckId: string | null
}

export const Board: React.FC<BoardProps> = ({ game }) => {
  const { users } = useUsers()
  const { decks } = useDecks()
  const { updateGame } = useGames()

  const [playerSections, setPlayerSections] = useState<PlayerSection[]>(() => {
    // Initialize with existing players from game
    const sections: PlayerSection[] = game.players.map(player => ({
      id: crypto.randomUUID(),
      userId: player.userId,
      deckId: player.deck
    }))

    // Add at least one empty section
    if (sections.length === 0) {
      sections.push({ id: crypto.randomUUID(), userId: null, deckId: null })
    }

    return sections
  })

  const [showSettings, setShowSettings] = useState(false)
  const [showUserSelect, setShowUserSelect] = useState<string | null>(null)
  const [startingLife, setStartingLife] = useState<number>(game.players[0]?.life || 20)
  const [tracking, setTracking] = useState<Game['tracking']>(game.tracking)

  const addPlayerSection = () => {
    const newPlayerSections = [...playerSections, { id: crypto.randomUUID(), userId: null, deckId: null }]
    setPlayerSections(newPlayerSections)
    updateGamePlayers(newPlayerSections)
  }

  const updateGamePlayers = (newPlayerSections: PlayerSection[]) => {
    const players: Player[] = newPlayerSections
      .filter(section => section.userId && section.deckId)
      .map(section => ({
        userId: section.userId!,
        life: startingLife,
        deck: section.deckId!
      }))

    updateGame(game.id, {
      players,
      tracking
    })
  }

  const removePlayerSection = (sectionId: string) => {
    const newPlayerSections = playerSections.filter(section => section.id !== sectionId)
    setPlayerSections(newPlayerSections)
    updateGamePlayers(newPlayerSections)
  }

  const selectUser = (sectionId: string, userId: string) => {
    const newPlayerSections = playerSections.map(section =>
      section.id === sectionId ? { ...section, userId, deckId: null } : section
    )
    setPlayerSections(newPlayerSections)
    updateGamePlayers(newPlayerSections)
    setShowUserSelect(null)
  }

  const selectDeck = (sectionId: string, deckId: string) => {
    const newPlayerSections = playerSections.map(section =>
      section.id === sectionId ? { ...section, deckId } : section
    )
    setPlayerSections(newPlayerSections)
    updateGamePlayers(newPlayerSections)
  }

  const handlePlay = () => {
    const players: Player[] = playerSections
      .filter(section => section.userId && section.deckId)
      .map(section => ({
        userId: section.userId!,
        life: startingLife,
        deck: section.deckId!
      }))

    updateGame(game.id, {
      players,
      tracking,
      state: 'active'
    })
  }

  const validPlayers = playerSections.filter(section => section.userId && section.deckId)
  const canPlay = validPlayers.length >= 2

  const getUserById = (userId: string) => users.find(u => u.id === userId)
  const getDeckById = (deckId: string) => decks.find(d => d.id === deckId)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50">
      {/* Player Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {playerSections.map(section => (
          <div key={section.id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
            {section.userId ? (
              // Player is selected
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">{getUserById(section.userId)?.name || 'Unknown'}</h3>
                  <button
                    onClick={() => removePlayerSection(section.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {section.deckId ? (
                  // Deck is selected
                  <div>
                    <Deck deck={getDeckById(section.deckId)!} />
                  </div>
                ) : (
                  // Need to select deck
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Deck:</label>
                    <select
                      value=""
                      onChange={e => selectDeck(section.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Choose a deck...</option>
                      {decks.map(deck => (
                        <option key={deck.id} value={deck.id}>
                          {deck.name} ({deck.colors.join(', ')})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              // No player selected - show plus sign
              <button
                onClick={() => setShowUserSelect(section.id)}
                className="w-full h-32 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400"
              >
                <Plus size={48} />
                <span className="mt-2 text-lg font-medium">Add Player</span>
              </button>
            )}
          </div>
        ))}

        {/* Add more players button */}
        <button
          onClick={addPlayerSection}
          className="bg-white rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <Plus size={48} />
          <span className="mt-2 text-lg font-medium">Add Player</span>
        </button>
      </div>

      {/* Settings Overlay */}
      <div className="fixed top-2 right-2">
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Play Button */}
      {canPlay && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={handlePlay}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Play size={32} />
            <span className="text-lg font-bold">PLAY</span>
          </button>
        </div>
      )}

      {/* User Selection Modal */}
      {showUserSelect && (
        <Modal isOpen={!!showUserSelect} onClose={() => setShowUserSelect(null)} title="Select Player">
          <div className="space-y-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => selectUser(showUserSelect!, user.id)}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">{user.name}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Game Settings">
          <div className="space-y-6">
            {/* Starting Life */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Starting Life</h3>
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium">Starting Life:</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={startingLife}
                  onChange={e => {
                    const newLife = parseInt(e.target.value) || 20
                    setStartingLife(newLife)
                    updateGamePlayers(playerSections)
                  }}
                  className="w-20 p-2 border border-gray-300 rounded text-center"
                />
                <span className="text-sm text-gray-600">life points</span>
              </div>
            </div>

            {/* Tracking Type */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Life Tracking</h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="tracking"
                    value="full"
                    checked={tracking === 'full'}
                    onChange={e => {
                      const newTracking = e.target.value as 'full' | 'simple' | 'none'
                      setTracking(newTracking)
                      updateGamePlayers(playerSections)
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Full</div>
                    <div className="text-sm text-gray-600">Track all life changes and game events</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="tracking"
                    value="simple"
                    checked={tracking === 'simple'}
                    onChange={e => {
                      const newTracking = e.target.value as 'full' | 'simple' | 'none'
                      setTracking(newTracking)
                      updateGamePlayers(playerSections)
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Simple</div>
                    <div className="text-sm text-gray-600">Track only current life totals (no turn tracking)</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="tracking"
                    value="none"
                    checked={tracking === 'none'}
                    onChange={e => {
                      const newTracking = e.target.value as 'full' | 'simple' | 'none'
                      setTracking(newTracking)
                      updateGamePlayers(playerSections)
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">None</div>
                    <div className="text-sm text-gray-600">Game will not be tracked</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
