import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Button } from './Button'

export type SortOption = 'name' | 'date' | 'games' | 'decks' | 'colors' | 'creator'

interface ControlsSectionProps {
  hasMultipleItems: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder?: string
  sortBy: SortOption
  sortDirection: 'asc' | 'desc'
  onSortChange: (sortBy: SortOption) => void
  sortOptions: SortOption[]
}

export const ControlsSection: React.FC<ControlsSectionProps> = ({
  hasMultipleItems,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  sortBy,
  sortDirection,
  onSortChange,
  sortOptions
}) => {
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

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      // Toggle direction if same sort option
      onSortChange(sortBy) // This will be handled by the parent to toggle direction
    } else {
      onSortChange(newSortBy)
    }
  }

  return (
    <div className="flex gap-2 items-center empty:hidden">
      {/* Search Bar */}
      {hasMultipleItems && (
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />

          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      )}

      {/* Sort Dropdown */}
      {hasMultipleItems && (
        <div className="relative" ref={dropdownRef}>
          <Button variant="secondary" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </Button>

          {isDropdownOpen && (
            <div className="flex flex-col absolute top-full right-0 mt-1 rounded-lg shadow-lg z-10 overflow-clip">
              {sortOptions.map(option => (
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
  )
}
