import { Board } from './components/Board'
import { Decks } from './components/Decks'
import { DevToolsPanel } from './components/DevToolsPanel'
import { Games } from './components/Games'
import { ImportanceSlider } from './components/ImportanceSlider'
import { IntroScreen } from './components/IntroScreen'
import { Users } from './components/Users'
import { DecksProvider } from './contexts/DecksContext'
import { GamesProvider } from './contexts/GamesContext'
import { useGames } from './contexts/GamesContext'
import { ImportanceProvider } from './contexts/ImportanceContext'
import { UsersProvider } from './contexts/UsersContext'
import { useImportanceVisibility } from './hooks/useImportanceVisibility'

const AppContent: React.FC = () => {
  // Initialize the importance visibility system
  useImportanceVisibility()

  return (
    <UsersProvider>
      <GamesProvider>
        <DecksProvider>
          <AppMain />
          <DevToolsPanel />
          <ImportanceSlider />
        </DecksProvider>
      </GamesProvider>
    </UsersProvider>
  )
}

const AppMain: React.FC = () => {
  const { games } = useGames()
  const setupGames = games.filter(game => game.state === 'setup')
  const activeGames = games.filter(game => game.state === 'active')

  return (
    <>
      {setupGames.length > 0 && <Board game={setupGames[0]} />}
      {activeGames.length === 0 && <IntroScreen />}

      <div className="flex flex-col lg:flex-row gap-8 p-4">
        <div className="flex-1">
          <Games />
        </div>
        <div className="flex-1">
          <Users />
        </div>
        <div className="flex-1">
          <Decks />
        </div>
      </div>
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
