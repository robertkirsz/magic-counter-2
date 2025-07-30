import { BookImageIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { ControlsSection } from './ControlsSection'
import type { SortOption } from './ControlsSection'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
import { FadeMask } from './FadeMask'

interface DecksProps {
  userId?: string
}

export const Decks: React.FC<DecksProps> = ({ userId }) => {
  const { decks } = useDecks()
  const [deckFormVisible, setDeckFormVisible] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(newSortBy)
      setSortDirection('asc')
    }
  }

  // Filter decks based on search query
  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return decks

    const query = searchQuery.toLowerCase().trim()

    return decks.filter(deck => {
      // Search by name
      if (deck.name.toLowerCase().includes(query)) return true

      // Search by colors
      const colorNames = {
        W: 'white',
        U: 'blue',
        B: 'black',
        R: 'red',
        G: 'green',
        C: 'colorless'
      }

      const deckColors = deck.colors.map(color => colorNames[color] || color).join(' ')

      if (deckColors.includes(query)) return true

      // Search by commanders
      if (deck.commanders) {
        const commanderNames = deck.commanders.map(c => c.name.toLowerCase()).join(' ')

        if (commanderNames.includes(query)) return true
      }

      return false
    })
  }, [decks, searchQuery])

  const sortedDecks = useMemo(() => {
    const sorted = [...filteredDecks].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'colors': {
          comparison = a.colors.length - b.colors.length
          if (comparison === 0) {
            comparison = a.colors.join('').localeCompare(b.colors.join(''))
          }
          break
        }
        case 'creator': {
          const aCreator = a.createdBy || 'Global'
          const bCreator = b.createdBy || 'Global'
          comparison = aCreator.localeCompare(bCreator)
          break
        }
        default:
          comparison = a.name.localeCompare(b.name)
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredDecks, sortBy, sortDirection])

  const hasDecks = sortedDecks.length > 0
  const hasMultipleDecks = decks.length > 1

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* Controls Section */}
      <ControlsSection
        hasMultipleItems={hasMultipleDecks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search decks by name, colors, or commanders..."
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        sortOptions={['name', 'date', 'colors', 'creator']}
      />

      {/* Decks List */}
      {hasDecks && (
        <FadeMask fadeHeight={24} showMask={sortedDecks.length > 3}>
          {/* TODO: make number of columns depend on container's width */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {sortedDecks.map((deck, index) => (
              <Deck key={deck.id} id={deck.id} testIndex={index} useContextControls />
            ))}
          </div>
        </FadeMask>
      )}

      {!hasDecks && (
        <div className="flex flex-col items-center justify-center text-center">
          <BookImageIcon size={48} className="text-slate-400" />

          <h3 className="text-xl font-semibold text-slate-300">
            {searchQuery.trim() ? 'No decks match your search' : 'No decks yet'}
          </h3>

          <p className="text-slate-400">
            {searchQuery.trim() ? 'Try a different search' : 'Add a deck to get started!'}
          </p>
        </div>
      )}

      {/* Deck Form Modal */}
      {deckFormVisible && (
        <DeckForm userId={userId} onSave={() => setDeckFormVisible(false)} onCancel={() => setDeckFormVisible(false)} />
      )}
    </div>
  )
}
