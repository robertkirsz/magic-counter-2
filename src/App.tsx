// import { useImportanceVisibility } from './hooks/useImportanceVisibility'
import pkg from '../package.json'
import { Board } from './components/Board'
import { DevToolsPanel } from './components/DevToolsPanel'
// import { ImportanceSlider } from './components/ImportanceSlider'
import { IntroScreen } from './components/IntroScreen'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { DecksProvider } from './contexts/DecksContext'
import { GamesProvider } from './contexts/GamesContext'
import { ImportanceProvider } from './contexts/ImportanceContext'
import { UsersProvider } from './contexts/UsersContext'
import { useGames } from './hooks/useGames'

const APP_VERSION = pkg.version

const AppContent: React.FC = () => {
  // Initialize the importance visibility system
  // useImportanceVisibility()

  return (
    <>
      <div className="fixed top-1 left-1 text-xs text-gray-400 z-50 pointer-events-none">v{APP_VERSION}</div>

      <UsersProvider>
        <GamesProvider>
          <DecksProvider>
            <AppMain />
            <DevToolsPanel />
            {/* <ImportanceSlider /> */}
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
      {lastNotFinishedGame && <Board gameId={lastNotFinishedGame.id} />}
      {!lastNotFinishedGame && <IntroScreen />}
    </>
  )
}

export default function App() {
  return (
    <ImportanceProvider>
      <AppContent />
      <PWAInstallPrompt />
    </ImportanceProvider>
  )
}
