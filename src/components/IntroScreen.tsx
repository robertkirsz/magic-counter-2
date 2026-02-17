import {
  BookOpen,
  History,
  List,
  Maximize2,
  Minimize2,
  Move,
  Plus,
  Settings,
  Table,
  Trophy,
  Users as UsersIcon
} from 'lucide-react'
import React, { Suspense, useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { EventDispatcher } from '../utils/eventDispatcher'
import { isFullscreen, toggleFullscreen } from '../utils/fullscreen'
import { Button } from './Button'
import { Modal } from './Modal'
import { Separator } from './ui/separator'

const DeckForm = React.lazy(() => import('./DeckForm').then(m => ({ default: m.DeckForm })))
const Decks = React.lazy(() => import('./Decks').then(m => ({ default: m.Decks })))
const GameForm = React.lazy(() => import('./GameForm').then(m => ({ default: m.GameForm })))
const Games = React.lazy(() => import('./Games').then(m => ({ default: m.Games })))
const UserForm = React.lazy(() => import('./UserForm').then(m => ({ default: m.UserForm })))
const Users = React.lazy(() => import('./Users').then(m => ({ default: m.Users })))

interface IntroScreenProps {
  gameId?: string
  tableMode?: boolean
  dragEnabled?: boolean
  gameState?: 'setup' | 'active' | 'finished'
  onTableModeChange?: (v: boolean) => void
  onDragEnabledChange?: (v: boolean) => void
  onShowGameSettings?: () => void
  onShowActions?: () => void
  onFinishGame?: () => void
  onNewGame?: () => void
  onClose?: () => void
  autoShowGameForm?: boolean
  onGameFormShown?: () => void
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  gameId,
  tableMode,
  dragEnabled,
  gameState,
  onTableModeChange,
  onDragEnabledChange,
  onShowGameSettings,
  onShowActions,
  onFinishGame,
  onNewGame,
  onClose,
  autoShowGameForm,
  onGameFormShown
}) => {
  const [showGames, setShowGames] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [showDecks, setShowDecks] = useState(false)
  const [showGameForm, setShowGameForm] = useState(false)
  const [deckFormVisible, setDeckFormVisible] = useState(false)
  const [userFormVisible, setUserFormVisible] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const { games, removeGame } = useGames()

  const hasGames = games.length > 0
  const isInGame = !!gameId

  useEffect(() => {
    if (autoShowGameForm) {
      setShowGameForm(true)
      onGameFormShown?.()
    }
  }, [autoShowGameForm, onGameFormShown])

  useEffect(() => {
    if (!isInGame) return

    const handleFullscreenChange = () => {
      setFullscreen(isFullscreen())
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    setFullscreen(isFullscreen())

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [isInGame])

  const handleToggleFullscreen = async () => {
    try {
      await toggleFullscreen()
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error)
    }
  }

  const handleNewGame = () => {
    if (isInGame && gameId) {
      const confirmed = window.confirm(
        'Are you sure you want to start a new game? The current game will be removed.'
      )
      if (!confirmed) return

      EventDispatcher.dispatchGameDelete(gameId)
      removeGame(gameId)
      onNewGame?.()
    } else {
      setShowGameForm(true)
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-4', !isInGame && 'h-svh')}>
      {!isInGame && <h1 className="mb-40 text-2xl text-center">Magic Counter</h1>}

      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        <Button variant="primary" className="col-span-2" onClick={handleNewGame}>
          <Plus size={20} />
          New Game
        </Button>

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

        {/* In-game settings */}
        {isInGame && (
          <>
            <Separator className="col-span-2 my-1" />

            <Button variant="secondary" onClick={() => onShowGameSettings?.()}>
              <Settings size={20} />
              Game Settings
            </Button>

            <Button variant="secondary" onClick={() => onShowActions?.()}>
              <List size={20} />
              Game Actions
            </Button>

            <Button
              variant="secondary"
              className={cn(dragEnabled && 'bg-primary text-primary-foreground hover:bg-primary/90')}
              onClick={() => {
                onDragEnabledChange?.(!dragEnabled)
                onClose?.()
              }}
            >
              <Move size={20} />
              Drag Mode
            </Button>

            <Button
              variant="secondary"
              className={cn(tableMode && 'bg-green-600 text-white hover:bg-green-500')}
              onClick={() => {
                onTableModeChange?.(!tableMode)
                onClose?.()
              }}
            >
              <Table size={20} />
              Table Mode
            </Button>

            <Button
              variant="secondary"
              className="col-span-2"
              onClick={() => {
                handleToggleFullscreen()
                onClose?.()
              }}
            >
              {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>

            {gameState === 'active' && (
              <>
                <Separator className="col-span-2 my-1" />
                <Button variant="danger" className="col-span-2" onClick={() => onFinishGame?.()}>
                  <Trophy size={20} />
                  Finish Game
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* GameForm Modal */}
      <Modal isOpen={showGameForm} onClose={() => setShowGameForm(false)} title="Game Form">
        <Suspense fallback={<div className="p-3 text-muted-foreground">Loading...</div>}>
          <GameForm onSave={() => setShowGameForm(false)} onCancel={() => setShowGameForm(false)} />
        </Suspense>
      </Modal>

      {/* Games Modal */}
      <Modal fullSize isOpen={showGames} onClose={() => setShowGames(false)} title="Games">
        <Suspense fallback={<div className="p-3 text-muted-foreground">Loading...</div>}>
          <Games className="flex-1" />
        </Suspense>
      </Modal>

      {/* Users Modal */}
      <Modal fullSize isOpen={showUsers} onClose={() => setShowUsers(false)} title="Users">
        <Suspense fallback={<div className="p-3 text-muted-foreground">Loading...</div>}>
          <Users className="flex-1" />
        </Suspense>

        <Button
          variant="primary"
          round
          className="absolute bottom-3 right-3 shadow-lg z-10"
          onClick={() => setUserFormVisible(true)}
        >
          <Plus size={36} />
        </Button>

        <Modal isOpen={userFormVisible} title="Add User" onClose={() => setUserFormVisible(false)}>
          <Suspense fallback={<div className="p-3 text-muted-foreground">Loading...</div>}>
            <UserForm onSave={() => setUserFormVisible(false)} onCancel={() => setUserFormVisible(false)} />
          </Suspense>
        </Modal>
      </Modal>

      {/* Decks Modal */}
      <Modal fullSize isOpen={showDecks} onClose={() => setShowDecks(false)} title="Decks">
        <Suspense fallback={<div className="p-3 text-muted-foreground">Loading...</div>}>
          <Decks className="flex-1" />
        </Suspense>

        <Button
          variant="primary"
          round
          className="absolute bottom-3 right-3 shadow-lg z-10"
          onClick={() => setDeckFormVisible(true)}
        >
          <Plus size={36} />
        </Button>

        <Modal isOpen={deckFormVisible} title="Add Deck" onClose={() => setDeckFormVisible(false)}>
          <Suspense fallback={<div className="p-3 text-muted-foreground">Loading...</div>}>
            <DeckForm onSave={() => setDeckFormVisible(false)} onCancel={() => setDeckFormVisible(false)} />
          </Suspense>
        </Modal>
      </Modal>
    </div>
  )
}
