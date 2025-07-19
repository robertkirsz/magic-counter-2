import { BookOpen, History, Plus, Users as UsersIcon } from 'lucide-react'
import React, { useState } from 'react'

import { useGames } from '../hooks/useGames'
import { Button } from './Button'
import { DeckForm } from './DeckForm'
import { Decks } from './Decks'
import { GameForm } from './GameForm'
import { Games } from './Games'
import { Modal } from './Modal'
import { UserForm } from './UserForm'
import { Users } from './Users'

export const IntroScreen: React.FC = () => {
  const [showGames, setShowGames] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [showDecks, setShowDecks] = useState(false)
  const [showGameForm, setShowGameForm] = useState(false)
  const [deckFormVisible, setDeckFormVisible] = useState(false)
  const [userFormVisible, setUserFormVisible] = useState(false)

  const { games } = useGames()

  const hasGames = games.length > 0
  const hasGamesInProgress = games.some(game => game.state === 'active' || game.state === 'setup')

  return (
    <div className="h-svh flex flex-col items-center justify-center p-4">
      <h1 className="mb-40 text-2xl text-gray-900 dark:text-white text-center">Magic Counter</h1>

      <div className="flex flex-col items-center gap-2">
        {!hasGamesInProgress && (
          <Button variant="primary" onClick={() => setShowGameForm(true)}>
            <Plus size={20} />
            New Game
          </Button>
        )}

        {hasGames && (
          <Button variant="secondary" onClick={() => setShowGames(true)}>
            <History size={20} />
            Past Games
          </Button>
        )}

        <Button variant="secondary" data-testid="intro-screen-users-button" onClick={() => setShowUsers(true)}>
          <UsersIcon size={20} />
          Users
        </Button>

        <Button variant="secondary" onClick={() => setShowDecks(true)}>
          <BookOpen size={20} />
          Decks
        </Button>
      </div>

      {/* GameForm Modal */}
      {showGameForm && (
        <Modal isOpen={showGameForm} onClose={() => setShowGameForm(false)}>
          <GameForm onSave={() => setShowGameForm(false)} onCancel={() => setShowGameForm(false)} />
        </Modal>
      )}

      {/* Games Modal */}
      {showGames && (
        <Modal testId="games" fullSize isOpen={showGames} onClose={() => setShowGames(false)} title="Games">
          <Games />
        </Modal>
      )}

      {/* Users Modal */}
      {showUsers && (
        <Modal testId="users" fullSize isOpen={showUsers} onClose={() => setShowUsers(false)} title="Users">
          <Users />

          {/* Floating Add User Button */}
          <Button
            data-testid="users-add"
            variant="primary"
            round
            className="absolute bottom-3 right-3 shadow-lg z-10"
            onClick={() => setUserFormVisible(true)}
          >
            <Plus size={36} />
          </Button>

          {/* User Form Modal */}
          {userFormVisible && (
            <Modal isOpen={userFormVisible} title="Add User" onClose={() => setUserFormVisible(false)}>
              <UserForm onSave={() => setUserFormVisible(false)} onCancel={() => setUserFormVisible(false)} />
            </Modal>
          )}
        </Modal>
      )}

      {/* Decks Modal */}
      {showDecks && (
        <Modal testId="decks" fullSize isOpen={showDecks} onClose={() => setShowDecks(false)} title="Decks">
          <Decks />

          {/* Floating Add Deck Button */}
          <Button
            variant="primary"
            round
            className="absolute bottom-3 right-3 shadow-lg z-10"
            onClick={() => setDeckFormVisible(true)}
          >
            <Plus size={36} />
          </Button>

          {/* Deck Form Modal */}
          {deckFormVisible && (
            <DeckForm onSave={() => setDeckFormVisible(false)} onCancel={() => setDeckFormVisible(false)} />
          )}
        </Modal>
      )}
    </div>
  )
}
