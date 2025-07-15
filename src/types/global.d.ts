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
  commanders: ScryfallCard[]
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
  activePlayer: User['id'] | null | undefined
  turnTracking: boolean
  actions: (LifeChangeAction | TurnChangeAction)[]
}

type LifeChangeAction = {
  id: string
  createdAt: Date
  type: 'life-change'
  value: number
  from?: User['id']
  to?: User['id'][]
}

type TurnChangeAction = {
  id: string
  createdAt: Date
  type: 'turn-change'
  from: User['id'] | null
  to: User['id'] | null
}
