import React, { type ReactNode, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { UsersContext, type UsersContextType } from './UsersContextDef'

interface UsersProviderProps {
  children: ReactNode
}

const LOCAL_STORAGE_KEY = 'users'

const readUsers = (): User[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) return JSON.parse(stored).map((u: User) => ({ ...u, createdAt: new Date(u.createdAt) }))
  return []
}

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(readUsers())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users)), [users])

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date()
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
