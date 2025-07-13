import { Plus, Search } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'

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

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Controls Section */}
        <div className="flex gap-2 items-center w-full">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

            <input
              type="text"
              placeholder="Search decks by name, colors, or commanders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              <span className="ml-2 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                {(['name', 'date', 'colors', 'creator'] as SortOption[]).map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      handleSortChange(option)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                      sortBy === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                    {sortBy === option && <span className="ml-2 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Deck Button */}
          <button
            onClick={() => setDeckFormVisible(true)}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Deck
          </button>
        </div>

        {/* Decks List */}
        <div className="flex flex-col gap-2">
          {sortedDecks.length === 0 ? (
            <p className="text-gray-500 italic">
              {searchQuery.trim() ? 'No decks match your search.' : 'No decks yet. Add your first deck!'}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedDecks.map(deck => (
                <Deck key={deck.id} id={deck.id} useContextControls />
              ))}
            </div>
          )}
        </div>

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
    </>
  )
}
