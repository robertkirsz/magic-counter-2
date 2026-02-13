import React, { Suspense } from 'react'

import pkg from '../package.json'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { DecksProvider } from './contexts/DecksContext'
import { GamesProvider } from './contexts/GamesContext'
import { UsersProvider } from './contexts/UsersContext'
import { useGames } from './hooks/useGames'

const Board = React.lazy(() => import('./components/Board').then(m => ({ default: m.Board })))
const DevToolsPanel = React.lazy(() => import('./components/DevToolsPanel').then(m => ({ default: m.DevToolsPanel })))
const IntroScreen = React.lazy(() => import('./components/IntroScreen').then(m => ({ default: m.IntroScreen })))

const APP_VERSION = pkg.version

const AppContent: React.FC = () => {
  return (
    <>
      <div className="fixed top-1 left-1 text-xs text-slate-400 z-50 pointer-events-none">v{APP_VERSION}</div>

      <UsersProvider>
        <GamesProvider>
          <DecksProvider>
            <Suspense fallback={null}>
              <AppMain />
              <DevToolsPanel />
            </Suspense>
          </DecksProvider>
        </GamesProvider>
      </UsersProvider>
    </>
  )
}

const AppMain: React.FC = () => {
  const { games } = useGames()
  const lastNotFinishedGame = games.filter(game => game.state !== 'finished').pop()

  return (
    <>
      {lastNotFinishedGame && (
        <Suspense fallback={null}>
          <Board gameId={lastNotFinishedGame.id} />
        </Suspense>
      )}
      {!lastNotFinishedGame && (
        <Suspense fallback={null}>
          <IntroScreen />
        </Suspense>
      )}
    </>
  )
}

export default function App() {
  return (
    <>
      <AppContent />
      <PWAInstallPrompt />
    </>
  )
}
