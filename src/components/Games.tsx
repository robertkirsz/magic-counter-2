import { SwordsIcon } from 'lucide-react'
import React, { useState } from 'react'

import { useGames } from '../hooks/useGames'
import { Game } from './Game'

export const Games: React.FC = () => {
  const { games, removeGame } = useGames()
  const [expandedGame, setExpandedGame] = useState<string | null>(null)

  const hasGames = games.length > 0

  return (
    <div className="flex flex-col gap-6">
      {hasGames && (
        <div className="grid gap-6">
          {games.map(game => (
            <Game
              key={game.id}
              game={game}
              isExpanded={expandedGame === game.id}
              onToggleExpanded={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
              onRemove={() => removeGame(game.id)}
            />
          ))}
        </div>
      )}

      {!hasGames && (
        <div className="flex flex-col items-center justify-center text-center">
          <SwordsIcon size={48} className="text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No games yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Create your first game to get started</p>
        </div>
      )}
    </div>
  )
}
