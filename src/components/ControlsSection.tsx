import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import React from 'react'

import { Dropdown } from './Dropdown'

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
        <label className="input grow">
          <Search className="h-[1em] opacity-50" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </label>
      )}

      {/* Sort Dropdown */}
      {hasMultipleItems && (
        <Dropdown
          triggerClassName="btn"
          trigger={
            <>
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </>
          }
        >
          <ul className="menu dropdown-content bg-base-100 rounded-box z-1 p-2 mt-1 shadow-sm">
            {sortOptions.map(option => (
              <li key={option}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm justify-start"
                  onClick={() => handleSortChange(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                  {sortBy === option && (sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                </button>
              </li>
            ))}
          </ul>
        </Dropdown>
      )}
    </div>
  )
}
