import { Games } from './components/Games'
import { Users } from './components/Users'
import { GamesProvider } from './contexts/GamesContext'
import { UsersProvider } from './contexts/UsersContext'

export default function App() {
  return (
    <UsersProvider>
      <GamesProvider>
        <div className="flex flex-col md:flex-row gap-8 p-4">
          <div className="flex-1">
            <Games />
          </div>
          <div className="flex-1">
            <Users />
          </div>
        </div>
      </GamesProvider>
    </UsersProvider>
  )
}
