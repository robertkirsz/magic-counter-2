import { Games } from './components/Games'
import { GamesProvider } from './contexts/GamesContext'

export default function App() {
  return (
    <GamesProvider>
      <Games />
    </GamesProvider>
  )
}
