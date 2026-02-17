import { BookImageIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { cn } from '../utils/cn'
import { ControlsSection } from './ControlsSection'
import type { SortOption } from './ControlsSection'
import { Deck } from './Deck'
import { FadeMask } from './FadeMask'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

interface DecksProps extends React.HTMLAttributes<HTMLDivElement> {
  userId?: string
  onDeckClick?: (deckId: string) => void
}

export const Decks: React.FC<DecksProps> = ({ userId, onDeckClick, ...props }) => {
  const { decks } = useDecks()
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyUserDecks, setShowOnlyUserDecks] = useState(true)

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(newSortBy)
      setSortDirection('asc')
    }
  }

  const filteredDecks = useMemo(() => {
    let filtered = decks

    if (showOnlyUserDecks && userId) {
      filtered = filtered.filter(deck => deck.createdBy === userId)
    }

    if (!searchQuery.trim()) return filtered

    const query = searchQuery.toLowerCase().trim()

    return filtered.filter(deck => {
      if (deck.name.toLowerCase().includes(query)) return true

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

      if (deck.commanders) {
        const commanderNames = deck.commanders.map(c => c.name.toLowerCase()).join(' ')

        if (commanderNames.includes(query)) return true
      }

      return false
    })
  }, [decks, searchQuery, showOnlyUserDecks, userId])

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
    <div className={cn('flex flex-col gap-4 overflow-hidden', props.className)}>
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

      {userId && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-only-user-decks"
            checked={showOnlyUserDecks}
            onCheckedChange={checked => setShowOnlyUserDecks(checked === true)}
          />
          <Label htmlFor="show-only-user-decks" className="text-sm cursor-pointer">
            Show only my decks
          </Label>
        </div>
      )}

      {hasDecks && (
        <FadeMask>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {sortedDecks.map(deck => (
              <Deck
                key={deck.id}
                id={deck.id}
                useContextControls={!onDeckClick}
                onClick={onDeckClick ? () => onDeckClick(deck.id) : undefined}
                className={onDeckClick ? 'cursor-pointer' : undefined}
              />
            ))}
          </div>
        </FadeMask>
      )}

      {!hasDecks && (
        <div className="m-auto flex flex-col items-center justify-center text-center">
          <BookImageIcon size={48} className="text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            {searchQuery.trim() || showOnlyUserDecks ? 'No decks match your criteria' : 'No decks yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery.trim() || showOnlyUserDecks
              ? 'Try adjusting your search or filters'
              : 'Add a deck to get started!'}
          </p>
        </div>
      )}
    </div>
  )
}
