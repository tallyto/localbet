import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

interface AuthUser {
  userId: string
  name: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, acceptedTerms: boolean) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, userId, name } = res.data
    queryClient.clear()
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify({ userId, name, email }))
    setToken(t)
    setUser({ userId, name, email })
  }

  const register = async (name: string, email: string, password: string, acceptedTerms: boolean) => {
    const res = await api.post('/auth/register', { name, email, password, acceptedTerms })
    const { token: t, userId } = res.data
    queryClient.clear()
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify({ userId, name, email }))
    setToken(t)
    setUser({ userId, name, email })
  }

  const logout = () => {
    queryClient.clear()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
