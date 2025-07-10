import React, { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface UsersContextType {
  users: User[]
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User
  removeUser: (userId: string) => void
  updateUser: (userId: string, updates: Partial<User>) => void
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

interface UsersProviderProps {
  children: ReactNode
}

const LOCAL_STORAGE_KEY = 'users'

const readUsers = (): User[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) return JSON.parse(stored).map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) }))
  return []
}

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(readUsers())

  useEffect(() => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users)), [users])

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
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
    updateUser
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext)
  if (context === undefined) throw new Error('useUsers must be used within a UsersProvider')
  return context
}
