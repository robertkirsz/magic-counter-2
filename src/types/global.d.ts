type GameState = 'setup' | 'active' | 'finished'
type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'
type DeckOption = 'infect' | 'monarch'

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
  options?: DeckOption[]
}

/**
 * User is a user of the application.
 * They can be a player in a game.
 */
type User = {
  id: string
  createdAt: Date
  name: string
}

/**
 * Player is a player in a game.
 * They are identified by their user ID.
 */
type Player = {
  id: string
  userId: User['id'] | null
  deckId: Deck['id'] | null
}

type WinCondition = 'combat-damage' | 'commander-damage' | 'poison' | 'mill' | 'card-rule' | 'other'

type Game = {
  id: string
  createdAt: Date
  state: GameState
  players: Player[]
  activePlayerId: User['id'] | null
  effectiveActivePlayerId?: User['id'] | null
  turnTracking: boolean
  startingLife: number
  commanders: boolean
  monarch?: User['id'] | null
  actions: (LifeChangeAction | TurnChangeAction | MonarchChangeAction)[]
  winner?: User['id']
  winCondition?: WinCondition
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

type MonarchChangeAction = {
  type: 'monarch-change'
  id: string
  createdAt: Date
  from?: User['id'] | null
  to?: User['id'] | null
}
