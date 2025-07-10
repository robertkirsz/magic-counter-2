type Decks = {
  id: string
  name: string
  createdAt: Date
  colors: string[]
  commanders?: string[]
}

type User = {
  id: string
  name: string
  createdAt: Date
  decks: Decks['id'][]
}

type Player = {
  userId: User['id']
  life: number
  deck: Decks['id'] | null
}

type Game = {
  id: string
  createdAt: Date
  players: User['id'][]
  activePlayer: User['id'] | null
  tracking: 'full' | 'simple' | 'none'
}
