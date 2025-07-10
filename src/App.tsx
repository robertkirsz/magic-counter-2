export default function App() {
  const game: Game = {
    id: '1',
    createdAt: new Date(),
    players: ['1'],
  }
  
  const user: User = {
    id: '1',
    name: 'John Doe',
    createdAt: new Date(),
    decks: [],
  }
  
  return <div className="text-3xl font-bold underline">Hello World</div>
}
