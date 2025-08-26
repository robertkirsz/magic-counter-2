export const calculateLifeFromActions = (game: Game, playerId: string): number => {
  const player = game.players.find(p => p.id === playerId)
  if (!player) return 0

  let life = game.startingLife

  game.actions.forEach(action => {
    if (action.type === 'life-change') {
      if (action.to?.includes(playerId)) {
        life += action.value
      }
    }
  })

  return life
}

export const isPlayerEliminated = (game: Game, playerId: string): boolean => {
  const currentLife = calculateLifeFromActions(game, playerId)

  // Check if life is below 1 (eliminated)
  if (currentLife < 1) return true

  // Check if any commander has dealt more than 20 damage (21+ damage eliminates)
  const commanderDamageActions = game.actions.filter(action => {
    if (action.type !== 'life-change') return false
    if (!action.commanderId) return false
    if (!action.to?.includes(playerId)) return false
    return action.value < 0 // Only damage, not life gain
  })

  // Group damage by commander ID to check each commander separately
  const commanderDamageMap = new Map<string, number>()

  commanderDamageActions.forEach(action => {
    const commanderId = (action as LifeChangeAction).commanderId!
    const currentDamage = commanderDamageMap.get(commanderId) || 0
    commanderDamageMap.set(commanderId, currentDamage + Math.abs((action as LifeChangeAction).value))
  })

  // Check if ANY commander has dealt 21 or more damage (each commander is checked separately)
  for (const damage of commanderDamageMap.values()) {
    if (damage >= 21) {
      return true // Player is eliminated by this commander
    }
  }

  return false
}

export const getActivePlayers = (game: Game): Player[] => {
  return game.players.filter(player => !isPlayerEliminated(game, player.id))
}

export const getCurrentMonarch = (game: Game): User['id'] | null => {
  // Find the last monarch change action to determine current monarch
  const lastMonarchAction = [...game.actions].reverse().find(action => action.type === 'monarch-change') as
    | MonarchChangeAction
    | undefined

  if (!lastMonarchAction) {
    // No monarch change actions, check if game has a monarch field set
    return game.monarch || null
  }

  return lastMonarchAction.to || null
}
