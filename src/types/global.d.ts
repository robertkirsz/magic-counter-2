type Decks = {
  id: string
  name: string
  createdAt: Date
  commanders?: string[]
  // add more fields as needed
}

type User = {
  id: string
  name: string
  createdAt: Date
  decks: Decks['id'][]
  // add more fields as needed
}

type Game = {
  id: string
  createdAt: Date
  players: User['id'][]
  // add more fields as needed
}
