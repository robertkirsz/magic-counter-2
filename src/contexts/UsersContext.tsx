import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import { generateId } from '../utils/idGenerator'
import { UsersContext, type UsersContextType } from './UsersContextDef'

interface UsersProviderProps {
  children: React.ReactNode
}

const LOCAL_STORAGE_KEY = 'users'

const readUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (stored) return JSON.parse(stored).map((user: User) => ({ ...user, createdAt: new Date(user.createdAt) }))

    return []
  } catch (e) {
    window.alert(
      `Could not load user data from localStorage (key: ${LOCAL_STORAGE_KEY}).\nError: ${e instanceof Error ? e.message : e}`
    )

    if (window.confirm('Clear the corrupted data and load default state?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      window.location.reload()
    }

    return []
  }
}

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(readUsers())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users)), [users])

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: DateTime.now().toJSDate()
    }

    setUsers(prev => [...prev, newUser])

    return newUser
  }

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
  }

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => (user.id === userId ? { ...user, ...updates } : user)))
  }

  const value: UsersContextType = {
    users,
    addUser,
    removeUser,
    updateUser,
    setUsers
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}
