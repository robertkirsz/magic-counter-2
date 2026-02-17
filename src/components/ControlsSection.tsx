import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import React from 'react'

import { Button } from './Button'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

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
  return (
    <div className="flex gap-2 items-center empty:hidden">
      {/* Search Bar */}
      {hasMultipleItems && (
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
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
              <DropdownMenuItem
                key={option}
                onClick={() => onSortChange(option)}
              >
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
