type Tracking = 'full' | 'simple' | 'none'
type GameState = 'active' | 'archived'
type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

type ScryfallCard = {
  name: string
  type_line: string
  oracle_text?: string
  colors?: string[]
  color_identity?: string[]
  image_uris?: {
    art_crop?: string
    small?: string
  }
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
