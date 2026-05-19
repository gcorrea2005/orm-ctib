import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  id: number
  email: string
  name: string | null
  activo: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string) => Promise<boolean>
  logout: () => void
  register: (email: string, name: string) => Promise<boolean>
  users: User[]
  loading: boolean
  refreshUsers: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'ctib_current_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
      setError(null)
    } catch (err) {
      console.error('Error loading users:', err)
      setError('No se pudo conectar al servidor')
    } finally {
      setLoading(false)
    }
  }

  const refreshUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (err) {
      console.error('Error refreshing users:', err)
    }
  }

  const login = async (email: string): Promise<boolean> => {
    try {
      setError(null)
      const found = await api.loginUser(email)
      setUser(found)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
      return true
    } catch (err) {
      console.error('Login error:', err)
      setError('Error al iniciar sesión')
      return false
    }
  }

  const register = async (email: string, name: string): Promise<boolean> => {
    try {
      setError(null)
      const created = await api.registerUser(email, name)
      setUser(created)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(created))
      await refreshUsers()
      return true
    } catch (err) {
      console.error('Register error:', err)
      setError('Error al registrar')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, users, loading, refreshUsers, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}