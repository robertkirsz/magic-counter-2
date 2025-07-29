import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

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
    id: uuidv4(),
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

        // Random life change (damage or healing)
        const lifeChangeValue = Math.floor(Math.random() * 10) + 1
        const isDamage = Math.random() > 0.3 // 70% chance of damage

        const currentPlayerId = players[currentPlayerIndex].id
        const lifeChangeAction: LifeChangeAction = {
          id: uuidv4(),
          createdAt: currentTime.toJSDate(),
          type: 'life-change',
          value: isDamage ? -lifeChangeValue : lifeChangeValue,
          from: currentPlayerId || undefined,
          to: currentPlayerId ? [currentPlayerId] : []
        }
        actions.push(lifeChangeAction)
      }

      // Pass turn to next player
      currentTime = currentTime.plus({ minutes: Math.floor(Math.random() * 5) + 1 })
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length

      const turnChangeAction: TurnChangeAction = {
        id: uuidv4(),
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
    id: uuidv4(),
    createdAt: currentTime.toJSDate(),
    type: 'turn-change',
    from: players[currentPlayerIndex].id,
    to: null
  }
  actions.push(endAction)

  // Create the finished game
  const game: Game = {
    id: uuidv4(),
    createdAt: gameStartTime.toJSDate(),
    state: 'finished',
    players,
    activePlayerId: null, // No active player since game is finished
    turnTracking,
    actions
  }

  return game
}
