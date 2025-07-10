import { Decks } from './components/Decks'
import { Games } from './components/Games'
import { Users } from './components/Users'
import { DecksProvider } from './contexts/DecksContext'
import { GamesProvider } from './contexts/GamesContext'
import { UsersProvider } from './contexts/UsersContext'

export default function App() {
  return (
    <UsersProvider>
      <GamesProvider>
        <DecksProvider>
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
        </DecksProvider>
      </GamesProvider>
    </UsersProvider>
  )
}
