import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

import { createFinishedGame } from './gameGenerator'
import { generateId } from './idGenerator'

// Deck archetypes for random deck generation
const DECK_ARCHETYPES = ['Aggro', 'Control', 'Combo', 'Midrange', 'Tempo', 'Ramp', 'Burn', 'Tribal']

interface GenerateRandomUserOptions {
  name?: string
  randomNumber?: number
}

export const generateRandomUser = (options: GenerateRandomUserOptions = {}): Omit<User, 'id' | 'createdAt'> => {
  const { name, randomNumber } = options

  if (name) {
    return { name }
  }

  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const number = randomNumber ?? Math.floor(Math.random() * 1000)
  return { name: `${firstName} ${lastName}${number}` }
}

interface GenerateRandomDeckOptions {
  name?: string
  randomNumber?: number
  colors?: ManaColor[]
  commanders?: ScryfallCard[]
  createdBy?: string | null
  options?: DeckOption[]
}

export const generateRandomDeck = (options: GenerateRandomDeckOptions = {}): Omit<Deck, 'id' | 'createdAt'> => {
  const { name, randomNumber, colors, commanders, createdBy, options: deckOptions } = options

  if (name) {
    return {
      name,
      colors: colors ?? ['C' as ManaColor],
      commanders: commanders ?? [],
      options: deckOptions,
      createdBy: createdBy ?? null
    }
  }

  const number = randomNumber ?? Math.floor(Math.random() * 1000)
  const deckArchetype = DECK_ARCHETYPES[Math.floor(Math.random() * DECK_ARCHETYPES.length)]
  const deckTheme = faker.word.adjective()
  const randomDeckName = `${deckArchetype} ${deckTheme}`

  const selectedCommanders = commanders ?? []

  const allColors = selectedCommanders.map(commander => commander.colors).flat()
  const uniqueColors = [...new Set(allColors)]

  // Randomly add some deck options
  const randomOptions: DeckOption[] = []
  if (Math.random() > 0.7) randomOptions.push('infect')
  if (Math.random() > 0.8) randomOptions.push('monarch')

  return {
    name: `${randomDeckName} Deck ${number}`,
    colors: colors ?? (uniqueColors.length > 0 ? (uniqueColors as ManaColor[]) : ['C' as ManaColor]),
    commanders: selectedCommanders,
    options: deckOptions ?? (randomOptions.length > 0 ? randomOptions : undefined),
    createdBy: createdBy ?? null
  }
}

interface GenerateRandomGameOptions {
  playerCount?: number
  turnTracking?: boolean
  startingLife?: number
  commanders?: boolean
  users?: User[]
  decks?: Deck[]
}

export const generateRandomGame = (options: GenerateRandomGameOptions = {}): Omit<Game, 'id' | 'createdAt'> => {
  const { playerCount, turnTracking, startingLife, commanders, users, decks } = options

  const count = playerCount ?? Math.floor(Math.random() * 3) + 2
  const tracking = turnTracking ?? (users?.length === 0 ? false : Math.random() > 0.8)
  const life = startingLife ?? (count >= 4 ? 40 : 20)
  const useCommanders = commanders ?? (count >= 3 && Math.random() > 0.75)

  const players: Player[] = []

  // Only check for users/decks if turn tracking is enabled AND we don't have them
  if (tracking && (!users || users.length === 0 || !decks || decks.length === 0)) {
    throw new Error('You need at least one user and one deck to generate a tracked game.')
  }

  if (tracking && users && decks) {
    // For tracked games, assign users and decks
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5)
    const shuffledDecks = [...decks].sort(() => Math.random() - 0.5)

    for (let i = 0; i < count; i++) {
      const user = shuffledUsers[i] || null
      const deck = shuffledDecks[i] || null

      players.push({
        id: `player-${i + 1}`,
        userId: user?.id || null,
        deckId: deck?.id || null
      })
    }
  } else {
    // For untracked games, create players without assignments
    for (let i = 0; i < count; i++) {
      players.push({
        id: `player-${i + 1}`,
        userId: null,
        deckId: null
      })
    }
  }

  return {
    state: 'setup' as GameState,
    players,
    activePlayerId: null,
    turnTracking: tracking,
    startingLife: life,
    commanders: useCommanders,
    monarch: null,
    actions: []
  }
}

interface GenerateFinishedGameOptions {
  playerCount?: number
  turnTracking?: boolean
  startingLife?: number
  users?: User[]
  decks?: Deck[]
  gameStartTime?: DateTime
  actionCount?: number
}

export const generateFinishedGame = (options: GenerateFinishedGameOptions = {}): Game => {
  const { playerCount, turnTracking, startingLife, users, decks, gameStartTime, actionCount } = options

  const count = playerCount ?? Math.floor(Math.random() * 3) + 2
  const tracking = turnTracking ?? (users?.length === 0 ? false : Math.random() > 0.9)
  const life = startingLife ?? (Math.random() > 0.5 ? 40 : 20)

  if (tracking && (!users || users.length === 0 || !decks || decks.length === 0)) {
    throw new Error('You need at least one user and one deck to generate a tracked finished game.')
  }

  let finishedGame: Game

  if (tracking && users && decks) {
    // For tracked games, use the existing function
    finishedGame = createFinishedGame(users, decks)
  } else {
    // For untracked games, create a simple finished game without turn tracking
    const players: Player[] = []
    for (let i = 0; i < count; i++) {
      players.push({
        id: `player-${i + 1}`,
        userId: null,
        deckId: null
      })
    }

    // Generate simple life change actions for untracked games
    const actions: LifeChangeAction[] = []
    const startTime = gameStartTime ?? DateTime.now().minus({ hours: Math.floor(Math.random() * 3) + 1 })
    let currentTime = startTime

    // Generate 5-15 random life changes
    const actionCountValue = actionCount ?? Math.floor(Math.random() * 10) + 5
    for (let i = 0; i < actionCountValue; i++) {
      currentTime = currentTime.plus({ minutes: Math.floor(Math.random() * 10) + 1 })

      const randomPlayer = players[Math.floor(Math.random() * players.length)]
      const lifeChangeValue = Math.floor(Math.random() * 10) + 1
      const isDamage = Math.random() > 0.3 // 70% chance of damage

      const lifeChangeAction: LifeChangeAction = {
        id: generateId(),
        createdAt: currentTime.toJSDate(),
        type: 'life-change',
        value: isDamage ? -lifeChangeValue : lifeChangeValue,
        from: randomPlayer.id,
        to: [randomPlayer.id]
      }
      actions.push(lifeChangeAction)
    }

    finishedGame = {
      id: generateId(),
      createdAt: startTime.toJSDate(),
      state: 'finished',
      players,
      activePlayerId: null,
      turnTracking: false,
      startingLife: life,
      commanders: false,
      actions
    }
  }

  return finishedGame
}
