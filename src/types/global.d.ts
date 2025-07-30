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
  deckId: Deck['id'] | null
}

type Game = {
  id: string
  createdAt: Date
  state: GameState
  players: Player[]
  activePlayerId: User['id'] | null
  turnTracking: boolean
  startingLife: number
  commanders: boolean
  actions: (LifeChangeAction | TurnChangeAction)[]
}

type LifeChangeAction = {
  type: 'life-change'
  id: string
  createdAt: Date
  from?: User['id']
  to: User['id'][]
  value: number
  commanderId?: ScryfallCard['id']
}

type TurnChangeAction = {
  type: 'turn-change'
  id: string
  createdAt: Date
  from?: User['id']
  to?: User['id']
}
