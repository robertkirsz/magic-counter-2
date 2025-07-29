import { ArrowDown, ArrowUp, Search, UsersIcon } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useUsers } from '../hooks/useUsers'
import { Button } from './Button'
import { DeckForm } from './DeckForm'
import { FadeMask } from './FadeMask'
import { Modal } from './Modal'
import { User } from './User'
import { UserForm } from './UserForm'

export const Users: React.FC = () => {
  const { users, removeUser } = useUsers()

  const [editingId, setEditingId] = useState<string>()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'games' | 'decks'>('name')
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

  const handleSortChange = (newSortBy: 'name' | 'date' | 'games' | 'decks') => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(newSortBy)
      setSortDirection('asc')
    }
  }

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase().trim()

    return users.filter(user => {
      // Search by name
      if (user.name.toLowerCase().includes(query)) return true
      return false
    })
  }, [users, searchQuery])

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'games':
          // For now, we'll sort by name as a fallback since we don't have games data here
          comparison = a.name.localeCompare(b.name)
          break
        case 'decks':
          // For now, we'll sort by name as a fallback since we don't have decks data here
          comparison = a.name.localeCompare(b.name)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredUsers, sortBy, sortDirection])

  const hasUsers = sortedUsers.length > 0
  const hasMultipleUsers = users.length > 1

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      {/* Controls Section */}
      {hasUsers && (
        <div className="flex gap-2 items-center empty:hidden">
          {/* Search Bar */}
          {hasMultipleUsers && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

              <input
                type="text"
                placeholder="Search users by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          )}

          {/* Sort Dropdown */}
          {hasMultipleUsers && (
            <div className="relative" ref={dropdownRef}>
              <Button variant="secondary" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </Button>

              {isDropdownOpen && (
                <div className="flex flex-col absolute top-full left-0 mt-1 rounded-lg shadow-lg z-10 min-w-[150px] overflow-clip">
                  {(['name', 'date', 'games', 'decks'] as const).map(option => (
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
      )}

      {/* Users List */}
      {hasUsers && (
        <FadeMask showMask={sortedUsers.length > 3}>
          <div className="flex flex-col gap-2">
            {sortedUsers.map((user, index) => (
              <User
                key={user.id}
                user={user}
                testIndex={index}
                onEdit={() => setEditingId(user.id)}
                onRemove={() => removeUser(user.id)}
                onCreateDeck={() => setSelectedUser(user.id)}
              />
            ))}
          </div>
        </FadeMask>
      )}

      {!hasUsers && (
        <div className="flex flex-col items-center justify-center text-center">
          <UsersIcon size={48} className="text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {searchQuery.trim() ? 'No users match your search' : 'No users yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery.trim() ? 'Try a different search' : 'Add someone to play with!'}
          </p>
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={!!editingId} title="Edit User" onClose={() => setEditingId(undefined)}>
        <UserForm userId={editingId} onSave={() => setEditingId(undefined)} onCancel={() => setEditingId(undefined)} />
      </Modal>

      {/* Add Deck Modal */}
      <Modal isOpen={!!selectedUser} title="Add Deck" onClose={() => setSelectedUser(null)}>
        <DeckForm userId={selectedUser} onSave={() => setSelectedUser(null)} onCancel={() => setSelectedUser(null)} />
      </Modal>
    </div>
  )
}
