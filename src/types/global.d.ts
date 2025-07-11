type Tracking = 'full' | 'simple' | 'none'
type GameState = 'active' | 'finished'
type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

type ScryfallCard = {
  id: string
  name: string
  type: string
  colors: string[]
  image?: string
}

type Deck = {
  id: string
  createdAt: Date
  createdBy?: User['id']
  name: string
  colors: ManaColor[]
  commanders?: ScryfallCard[]
}

type User = {
  id: string
  createdAt: Date
  name: string
}

type Player = {
  userId: User['id']
  life: number
  deck: Deck['id'] | null
}

type Game = {
  id: string
  createdAt: Date
  state: GameState
  players: Player[]
  activePlayer: User['id'] | null
  tracking: Tracking
}
