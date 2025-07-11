import { ChevronDown, Plus } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'

type SortOption = 'name' | 'date' | 'colors' | 'creator'

export const Decks: React.FC = () => {
  const { decks, addDeck, removeDeck, updateDeck } = useDecks()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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

  const handleAddDeck = (data: { name: Deck['name']; colors: Deck['colors']; commanders?: Deck['commanders'] }) => {
    setIsAdding(false)
    addDeck({
      name: data.name,
      colors: data.colors,
      commanders: data.commanders
    })
  }

  const handleSaveEdit = (data: { name: Deck['name']; colors: Deck['colors']; commanders?: Deck['commanders'] }) => {
    if (editingId) {
      setEditingId(null)
      updateDeck(editingId, {
        name: data.name,
        colors: data.colors,
        commanders: data.commanders
      })
    }
  }

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(newSortBy)
      setSortDirection('asc')
    }
  }

  const sortedDecks = useMemo(() => {
    const sorted = [...decks].sort((a, b) => {
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
  }, [decks, sortBy, sortDirection])

  return (
    <>
      <div className="flex flex-col gap-4 items-start">
        <h1 className="text-3xl font-bold text-gray-800">Decks</h1>

        {/* Controls Section */}
        <div className="flex gap-4 items-center">
          {/* Add Deck Button */}
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Deck
          </button>

          {/* Sort Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              <ChevronDown size={16} />
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
        </div>

        {/* Decks List */}
        <div className="flex flex-col gap-2">
          {sortedDecks.length === 0 ? (
            <p className="text-gray-500 italic">No decks yet. Add your first deck!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedDecks.map(deck => (
                <Deck key={deck.id} deck={deck} showCreator onEditDeck={setEditingId} onRemoveDeck={removeDeck} />
              ))}
            </div>
          )}
        </div>

        {/* Create Deck Modal */}
        {isAdding && <DeckForm onSave={handleAddDeck} onCancel={() => setIsAdding(false)} />}

        {/* Edit Deck Modal */}
        {editingId !== null && (
          <DeckForm
            deck={decks.find(d => d.id === editingId)}
            onSave={handleSaveEdit}
            onCancel={() => setEditingId(null)}
          />
        )}
      </div>
    </>
  )
}
