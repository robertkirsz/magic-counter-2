import { UsersIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { ControlsSection } from './ControlsSection'
import type { SortOption } from './ControlsSection'
import { DeckForm } from './DeckForm'
import { FadeMask } from './FadeMask'
import { Modal } from './Modal'
import { User } from './User'
import { UserForm } from './UserForm'

export const Users: React.FC<React.HTMLAttributes<HTMLDivElement>> = props => {
  const { users, removeUser } = useUsers()

  const [editingId, setEditingId] = useState<string>()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
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

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase().trim()

    return users.filter(user => {
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
          comparison = a.name.localeCompare(b.name)
          break
        case 'decks':
          comparison = a.name.localeCompare(b.name)
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredUsers, sortBy, sortDirection])

  const hasUsers = sortedUsers.length > 0
  const hasMultipleUsers = users.length > 1

  return (
    <div className={cn('flex flex-col gap-4 overflow-hidden', props.className)}>
      <ControlsSection
        hasMultipleItems={hasMultipleUsers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search users by name..."
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        sortOptions={['name', 'date', 'games', 'decks']}
      />

      {hasUsers && (
        <FadeMask>
          <div className="flex flex-col gap-2">
            {sortedUsers.map(user => (
              <User
                key={user.id}
                user={user}
                onEdit={() => setEditingId(user.id)}
                onRemove={() => removeUser(user.id)}
                onCreateDeck={() => setSelectedUser(user.id)}
              />
            ))}
          </div>
        </FadeMask>
      )}

      {!hasUsers && (
        <div className="m-auto flex flex-col items-center justify-center text-center">
          <UsersIcon size={48} className="text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            {searchQuery.trim() ? 'No users match your search' : 'No users yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery.trim() ? 'Try a different search' : 'Add someone to play with!'}
          </p>
        </div>
      )}

      <Modal isOpen={!!editingId} title="Edit User" onClose={() => setEditingId(undefined)}>
        <UserForm userId={editingId} onSave={() => setEditingId(undefined)} onCancel={() => setEditingId(undefined)} />
      </Modal>

      <Modal isOpen={!!selectedUser} title="Add Deck" onClose={() => setSelectedUser(null)}>
        <DeckForm userId={selectedUser} onSave={() => setSelectedUser(null)} onCancel={() => setSelectedUser(null)} />
      </Modal>
    </div>
  )
}
