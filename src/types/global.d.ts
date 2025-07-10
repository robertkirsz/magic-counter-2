type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

type Decks = {
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
