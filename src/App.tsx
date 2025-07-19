// import { useImportanceVisibility } from './hooks/useImportanceVisibility'
import pkg from '../package.json'
import { ActionsList } from './components/ActionsList'
import { Board } from './components/Board'
import { Decks } from './components/Decks'
import { DevToolsPanel } from './components/DevToolsPanel'
// import { ImportanceSlider } from './components/ImportanceSlider'
import { InstallPrompt } from './components/InstallPrompt'
import { IntroScreen } from './components/IntroScreen'
import { Users } from './components/Users'
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
      <div className="fixed top-1 left-1 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-md z-50 pointer-events-none">
        v{APP_VERSION}
      </div>

      <UsersProvider>
        <GamesProvider>
          <DecksProvider>
            <AppMain />
            <DevToolsPanel />
            {/* <ImportanceSlider /> */}
            <InstallPrompt />
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
    <div className="DevelopmentLayoutWrapper">
      {lastNotFinishedGame && <Board gameId={lastNotFinishedGame.id} />}
      {lastNotFinishedGame && <ActionsList gameId={lastNotFinishedGame.id} />}
      <IntroScreen />
      <Decks />
      <Users />
    </div>
  )
}

export default function App() {
  return (
    <ImportanceProvider>
      <AppContent />
    </ImportanceProvider>
  )
}
