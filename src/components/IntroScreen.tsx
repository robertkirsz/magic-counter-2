import { BookOpen, History, Plus, Users as UsersIcon } from 'lucide-react'
import React, { useState } from 'react'

import { useGames } from '../contexts/GamesContext'
import { useUsers } from '../contexts/UsersContext'
import { Decks } from './Decks'
import { GameForm } from './GameForm'
import { Games } from './Games'
import { Modal } from './Modal'
import { Users } from './Users'

export const IntroScreen: React.FC = () => {
  const [showGames, setShowGames] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [showDecks, setShowDecks] = useState(false)
  const [showGameForm, setShowGameForm] = useState(false)

  const { users, addUser } = useUsers()
  const { addGame } = useGames()

  const handleCreateGame = (data: { players: Player[]; tracking: Game['tracking'] }) => {
    addGame({
      players: data.players,
      activePlayer: null,
      tracking: data.tracking,
      state: 'setup'
    })
    setShowGameForm(false)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 safe-area-inset-top safe-area-inset-bottom">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 md:mb-8">Magic Counter</h1>
        <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-12">Track your Magic: The Gathering games</p>

        <div className="space-y-4">
          <button
            onClick={() => setShowGameForm(true)}
            className="w-full px-4 md:px-6 py-3 md:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-medium touch-manipulation"
          >
            <Plus size={20} className="md:w-6 md:h-6" />
            Create Game
          </button>

          <button
            onClick={() => setShowGames(true)}
            className="w-full px-4 md:px-6 py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-medium touch-manipulation"
          >
            <History size={20} className="md:w-6 md:h-6" />
            Past Games
          </button>

          <button
            onClick={() => setShowUsers(true)}
            className="w-full px-4 md:px-6 py-3 md:py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-medium touch-manipulation"
          >
            <UsersIcon size={20} className="md:w-6 md:h-6" />
            Users
          </button>

          <button
            onClick={() => setShowDecks(true)}
            className="w-full px-4 md:px-6 py-3 md:py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 active:bg-orange-800 transition-colors flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-medium touch-manipulation"
          >
            <BookOpen size={20} className="md:w-6 md:h-6" />
            Decks
          </button>
        </div>
      </div>

      {/* GameForm Modal */}
      {showGameForm && (
        <Modal isOpen={showGameForm} onClose={() => setShowGameForm(false)} title="Add New Game">
          <GameForm onSave={handleCreateGame} onCancel={() => setShowGameForm(false)} users={users} addUser={addUser} />
        </Modal>
      )}

      {/* Games Modal */}
      {showGames && (
        <Modal isOpen={showGames} onClose={() => setShowGames(false)} title="Games">
          <Games />
        </Modal>
      )}

      {/* Users Modal */}
      {showUsers && (
        <Modal isOpen={showUsers} onClose={() => setShowUsers(false)} title="Users">
          <Users />
        </Modal>
      )}

      {/* Decks Modal */}
      {showDecks && (
        <Modal isOpen={showDecks} onClose={() => setShowDecks(false)} title="Decks">
          <Decks />
        </Modal>
      )}
    </div>
  )
}
