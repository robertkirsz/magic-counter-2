import { ArrowDown, ArrowUp, Plus, Search } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { Button } from './Button'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
import { FadeMask } from './FadeMask'

type SortOption = 'name' | 'date' | 'colors' | 'creator'

interface DecksProps {
  userId?: string
}

export const Decks: React.FC<DecksProps> = ({ userId }) => {
  const { decks } = useDecks()
  const [deckFormVisible, setDeckFormVisible] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

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
      <div className="flex gap-2 items-center empty:hidden">
        {/* Search Bar */}
        {hasMultipleDecks && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

            <input
              type="text"
              placeholder="Search decks by name, colors, or commanders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        )}

        {/* Sort Dropdown */}
        {hasMultipleDecks && (
          <div className="relative" ref={dropdownRef}>
            <Button variant="secondary" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </Button>

            {isDropdownOpen && (
              <div className="flex flex-col absolute top-full left-0 mt-1 rounded-lg shadow-lg z-10 min-w-[150px] overflow-clip">
                {(['name', 'date', 'colors', 'creator'] as SortOption[]).map(option => (
                  <Button
                    key={option}
                    variant={sortBy === option ? 'primary' : 'secondary'}
                    className="rounded-none"
                    onClick={() => {
                      handleSortChange(option)
                      setIsDropdownOpen(false)
                    }}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                    {sortBy === option && (sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decks List */}
      {hasDecks && (
        <FadeMask fadeHeight={24} showMask={sortedDecks.length > 3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {sortedDecks.map(deck => (
              <Deck key={deck.id} id={deck.id} useContextControls />
            ))}
          </div>
        </FadeMask>
      )}

      {!hasDecks && (
        <p className="flex-1 flex justify-center items-center text-gray-500 italic">
          {searchQuery.trim() ? 'No decks match your search.' : 'No decks yet. Add your first deck!'}
        </p>
      )}

      {/* Floating Add Deck Button */}
      <Button
        variant="primary"
        round
        onClick={() => setDeckFormVisible(true)}
        className="absolute bottom-3 right-3 shadow-lg z-10"
      >
        <Plus size={36} />
      </Button>

      {/* Deck Form Modal */}
      {deckFormVisible && (
        <DeckForm
          userId={userId}
          onSave={() => {
            setDeckFormVisible(false)
          }}
          onCancel={() => {
            setDeckFormVisible(false)
          }}
        />
      )}
    </div>
  )
}
