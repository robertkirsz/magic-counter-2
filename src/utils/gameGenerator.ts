import { DateTime } from 'luxon'

import { generateId } from './idGenerator'

export const createFinishedGame = (users: User[], decks: Deck[]): Game => {
  // Random number of players (2-4)
  const playerCount = Math.floor(Math.random() * 3) + 2

  // Random starting life (20 or 40)
  const startingLife = Math.random() > 0.5 ? 40 : 20

  // Random turn tracking
  const turnTracking = Math.random() > 0.3

  // Shuffle users and decks
  const shuffledUsers = [...users].sort(() => Math.random() - 0.5)
  const shuffledDecks = [...decks].sort(() => Math.random() - 0.5)

  const players: Player[] = []

  for (let i = 0; i < playerCount; i++) {
    const user = shuffledUsers[i] || null
    const deck = shuffledDecks[i] || null

    players.push({
      id: `player-${i + 1}`,
      userId: user?.id || null,
      deckId: deck?.id || null,
      life: startingLife
    })
  }

  // Generate game actions to simulate a complete game
  const actions: (LifeChangeAction | TurnChangeAction)[] = []
  const gameStartTime = DateTime.now().minus({ hours: Math.floor(Math.random() * 3) + 1 })

  // Start the game with first player
  const startAction: TurnChangeAction = {
    id: generateId(),
    createdAt: gameStartTime.toJSDate(),
    type: 'turn-change',
    from: null,
    to: players[0].id
  }
  actions.push(startAction)

  // Simulate game progression with random life changes and turn changes
  let currentTime = gameStartTime
  let currentPlayerIndex = 0
  const rounds = Math.floor(Math.random() * 5) + 3 // 3-7 rounds

  for (let round = 0; round < rounds; round++) {
    // Each round has multiple turns
    const turnsInRound = Math.floor(Math.random() * 3) + 2 // 2-4 turns per round

    for (let turn = 0; turn < turnsInRound; turn++) {
      // Add some life changes during the turn
      const lifeChangesInTurn = Math.floor(Math.random() * 3) + 1 // 1-3 life changes per turn

      for (let lc = 0; lc < lifeChangesInTurn; lc++) {
        currentTime = currentTime.plus({ minutes: Math.floor(Math.random() * 10) + 1 })

        // Random life change value
        const lifeChangeValue = Math.floor(Math.random() * 10) + 1

        // Determine the type of life change based on probabilities
        const random = Math.random()
        let fromPlayerId: string | undefined
        let toPlayerIds: string[] = []
        let isDamage: boolean

        if (random < 0.1) {
          // 10% chance: current player heals himself
          const currentPlayerId = players[currentPlayerIndex].id
          fromPlayerId = currentPlayerId || undefined
          toPlayerIds = currentPlayerId ? [currentPlayerId] : []
          isDamage = false
        } else if (random < 0.2) {
          // 10% chance: current player deals damage to himself
          const currentPlayerId = players[currentPlayerIndex].id
          fromPlayerId = currentPlayerId || undefined
          toPlayerIds = currentPlayerId ? [currentPlayerId] : []
          isDamage = true
        } else if (random < 0.6) {
          // 40% chance: current player deals damage to other player
          const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex)
          const randomOtherPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)]
          fromPlayerId = players[currentPlayerIndex].id || undefined
          toPlayerIds = randomOtherPlayer.id ? [randomOtherPlayer.id] : []
          isDamage = true
        } else {
          // 20% chance: random player deals damage to other player
          const randomFromPlayer = players[Math.floor(Math.random() * players.length)]
          const otherPlayers = players.filter(player => player.id !== randomFromPlayer.id)
          const randomToPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)]
          fromPlayerId = randomFromPlayer.id || undefined
          toPlayerIds = randomToPlayer.id ? [randomToPlayer.id] : []
          isDamage = true
        }

        const lifeChangeAction: LifeChangeAction = {
          id: generateId(),
          createdAt: currentTime.toJSDate(),
          type: 'life-change',
          value: isDamage ? -lifeChangeValue : lifeChangeValue,
          from: fromPlayerId,
          to: toPlayerIds
        }
        actions.push(lifeChangeAction)
      }

      // Pass turn to next player
      currentTime = currentTime.plus({ minutes: Math.floor(Math.random() * 5) + 1 })
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length

      const turnChangeAction: TurnChangeAction = {
        id: generateId(),
        createdAt: currentTime.toJSDate(),
        type: 'turn-change',
        from: players[currentPlayerIndex].id,
        to: players[nextPlayerIndex].id
      }
      actions.push(turnChangeAction)

      currentPlayerIndex = nextPlayerIndex
    }
  }

  // End the game with a final turn change to null
  currentTime = currentTime.plus({ minutes: Math.floor(Math.random() * 5) + 1 })
  const endAction: TurnChangeAction = {
    id: generateId(),
    createdAt: currentTime.toJSDate(),
    type: 'turn-change',
    from: players[currentPlayerIndex].id,
    to: null
  }
  actions.push(endAction)

  // Create the finished game
  const game: Game = {
    id: generateId(),
    createdAt: gameStartTime.toJSDate(),
    state: 'finished',
    players,
    activePlayerId: null, // No active player since game is finished
    turnTracking,
    actions
  }

  return game
}
