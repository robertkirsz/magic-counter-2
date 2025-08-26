import { BookOpen, History, Plus, Users as UsersIcon } from 'lucide-react'
import React, { Suspense, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { Button } from './Button'
import { Modal } from './Modal'

const DeckForm = React.lazy(() => import('./DeckForm').then(m => ({ default: m.DeckForm })))
const Decks = React.lazy(() => import('./Decks').then(m => ({ default: m.Decks })))
const GameForm = React.lazy(() => import('./GameForm').then(m => ({ default: m.GameForm })))
const Games = React.lazy(() => import('./Games').then(m => ({ default: m.Games })))

const UserForm = React.lazy(() => import('./UserForm').then(m => ({ default: m.UserForm })))
const Users = React.lazy(() => import('./Users').then(m => ({ default: m.Users })))

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
      <h1 className="mb-40 text-2xl text-center">Magic Counter</h1>

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

        <Button variant="secondary" onClick={() => setShowUsers(true)}>
          <UsersIcon size={20} />
          Users
        </Button>

        <Button variant="secondary" onClick={() => setShowDecks(true)}>
          <BookOpen size={20} />
          Decks
        </Button>
      </div>

      {/* GameForm Modal */}
      <Modal isOpen={showGameForm} onClose={() => setShowGameForm(false)} title="Game Form">
        <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
          <GameForm onSave={() => setShowGameForm(false)} onCancel={() => setShowGameForm(false)} />
        </Suspense>
      </Modal>

      {/* Games Modal */}
      <Modal fullSize isOpen={showGames} onClose={() => setShowGames(false)} title="Games">
        <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
          <Games className="flex-1" />
        </Suspense>
      </Modal>

      {/* Users Modal */}
      <Modal fullSize isOpen={showUsers} onClose={() => setShowUsers(false)} title="Users">
        <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
          <Users className="flex-1" />
        </Suspense>

        {/* Floating Add User Button */}
        <Button
          variant="primary"
          round
          className="absolute bottom-3 right-3 shadow-lg z-10"
          onClick={() => setUserFormVisible(true)}
        >
          <Plus size={36} />
        </Button>

        {/* User Form Modal */}
        <Modal isOpen={userFormVisible} title="Add User" onClose={() => setUserFormVisible(false)}>
          <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
            <UserForm onSave={() => setUserFormVisible(false)} onCancel={() => setUserFormVisible(false)} />
          </Suspense>
        </Modal>
      </Modal>

      {/* Decks Modal */}
      <Modal fullSize isOpen={showDecks} onClose={() => setShowDecks(false)} title="Decks">
        <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
          <Decks className="flex-1" />
        </Suspense>

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
        <Modal isOpen={deckFormVisible} title="Add Deck" onClose={() => setDeckFormVisible(false)}>
          <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
            <DeckForm onSave={() => setDeckFormVisible(false)} onCancel={() => setDeckFormVisible(false)} />
          </Suspense>
        </Modal>
      </Modal>
    </div>
  )
}
