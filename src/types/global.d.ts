type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

type Deck = {
  id: string
  createdAt: Date
  name: string
  colors: ManaColor[]
  commanders?: string[]
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
  state: 'active' | 'archived'
  players: Player[]
  activePlayer: User['id'] | null
  tracking: 'full' | 'simple' | 'none'
}
