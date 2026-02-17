import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import React from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-400" size={20} />

          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Sort Dropdown */}
      {hasMultipleItems && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map(option => (
              <DropdownMenuItem key={option} onClick={() => handleSortChange(option)}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
                {sortBy === option && (sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
