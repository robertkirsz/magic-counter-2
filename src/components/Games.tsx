import { SwordsIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { ControlsSection } from './ControlsSection'
import type { SortOption } from './ControlsSection'
import { FadeMask } from './FadeMask'
import { Game } from './Game'

export const Games: React.FC = () => {
  const { games, removeGame } = useGames()
  const [expandedGame, setExpandedGame] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(newSortBy)
      setSortDirection('desc') // Default to newest first for games
    }
  }

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games

    const query = searchQuery.toLowerCase().trim()

    return games.filter(game => {
      // Search by game ID or state
      if (game.id.toLowerCase().includes(query)) return true
      if (game.state.toLowerCase().includes(query)) return true

      // Search by player IDs
      const playerIds = game.players.map(player => player.id.toLowerCase()).join(' ')
      if (playerIds.includes(query)) return true

      return false
    })
  }, [games, searchQuery])

  const sortedGames = useMemo(() => {
    const sorted = [...filteredGames].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.id.localeCompare(b.id)
          break
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'games':
          // For games, this could be game duration or number of players
          comparison = a.players.length - b.players.length
          break
        case 'decks':
          // For games, this could be number of decks used
          comparison = a.players.length - b.players.length
          break
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredGames, sortBy, sortDirection])

  const hasGames = sortedGames.length > 0
  const hasMultipleGames = games.length > 1

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* Controls Section */}
      <ControlsSection
        hasMultipleItems={hasMultipleGames}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search games by ID, state, or player IDs..."
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        sortOptions={['date', 'name', 'games']}
      />

      {hasGames && (
        <FadeMask fadeHeight={24} showMask={sortedGames.length > 3}>
          <div className="grid gap-6">
            {sortedGames.map(game => (
              <Game
                key={game.id}
                game={game}
                isExpanded={expandedGame === game.id}
                onToggleExpanded={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                onRemove={() => removeGame(game.id)}
              />
            ))}
          </div>
        </FadeMask>
      )}

      {!hasGames && (
        <div className="flex flex-col items-center justify-center text-center">
          <SwordsIcon size={48} className="text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {searchQuery.trim() ? 'No games match your search' : 'No games yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery.trim() ? 'Try a different search' : 'Create your first game to get started'}
          </p>
        </div>
      )}
    </div>
  )
}
