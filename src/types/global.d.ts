type GameState = 'setup' | 'active' | 'finished'
type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

type ScryfallCard = {
  id: string
  name: string
  type: string
  colors: string[]
  image: string | null
}

type Deck = {
  id: string
  createdAt: Date
  createdBy: User['id'] | null
  name: string
  colors: ManaColor[]
  commanders: ScryfallCard[] | null
}

type User = {
  id: string
  createdAt: Date
  name: string
}

type Player = {
  id: string
  userId: User['id'] | null
  life: number
  deckId: Deck['id'] | null
}

type Game = {
  id: string
  createdAt: Date
  state: GameState
  players: Player[]
  activePlayer: User['id'] | null
  turnTracking: boolean
}
