import { createContext } from 'react'

export interface UsersContextType {
  users: User[]
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User
  removeUser: (userId: string) => void
  updateUser: (userId: string, updates: Partial<User>) => void
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

export const UsersContext = createContext<UsersContextType | undefined>(undefined)
