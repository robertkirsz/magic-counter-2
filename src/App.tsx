import { Board } from './components/Board'
import { DevToolsPanel } from './components/DevToolsPanel'
// import { ImportanceSlider } from './components/ImportanceSlider'
import { IntroScreen } from './components/IntroScreen'
import { DecksProvider } from './contexts/DecksContext'
import { GamesProvider } from './contexts/GamesContext'
import { ImportanceProvider } from './contexts/ImportanceContext'
import { UsersProvider } from './contexts/UsersContext'
import { useGames } from './hooks/useGames'
import { useImportanceVisibility } from './hooks/useImportanceVisibility'
import pkg from '../package.json' assert { type: 'json' }
const APP_VERSION = pkg.version

const AppContent: React.FC = () => {
  // Initialize the importance visibility system
  useImportanceVisibility()

  return (
    <>
      <div className="fixed top-1 left-1 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-md z-50 pointer-events-none">v{APP_VERSION}</div>

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
  const activeGames = games.filter(game => game.state === 'active')
  const lastNotFinishedGame = games.filter(game => game.state !== 'finished').pop()

  return (
    <>
      {lastNotFinishedGame && <Board gameId={lastNotFinishedGame.id} />}
      {activeGames.length === 0 && <IntroScreen />}
    </>
  )
}

export default function App() {
  return (
    <ImportanceProvider>
      <AppContent />
    </ImportanceProvider>
  )
}
