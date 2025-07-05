'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  signUp,
  signIn,
  signOut,
  fetchAuthSession,
} from '@aws-amplify/auth'

type User = {
  username: string
  email: string
  roles: string[]
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  isAdmin: boolean
  isEmployee: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await fetchAuthSession()
        const idToken = session.tokens?.idToken?.payload

        // ✅ If not signed in, stop early
        if (!idToken?.email) {
          setUser(null)
          return
        }

        const email = idToken.email
        const name = idToken.name ?? ''
        const username = name || email.split('@')[0] || 'User'

        const rawGroups = idToken['cognito:groups'] ?? []
        const roles: string[] = Array.isArray(rawGroups)
          ? rawGroups.map((g) => g.toLowerCase())
          : typeof rawGroups === 'string'
          ? [rawGroups.toLowerCase()]
          : []

        setUser({ username, email, roles })
        console.log('[Auth] Loaded user:', { username, email, roles })
      } catch (err) {
        console.warn('[Auth] No valid session:', err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleSignUp = async (email: string, password: string, name: string) => {
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: { email, name },
      },
    })
  }

  const handleSignIn = async (email: string, password: string) => {
    await signIn({ username: email, password })
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken?.payload

    if (!idToken?.email) {
      setUser(null)
      return
    }

    const emailAttr = idToken.email
    const name = idToken.name ?? ''
    const username = name || emailAttr.split('@')[0] || 'User'
    const rawGroups = idToken['cognito:groups'] ?? []
    const roles = Array.isArray(rawGroups)
      ? rawGroups.map((r) => r.toLowerCase())
      : typeof rawGroups === 'string'
      ? [rawGroups.toLowerCase()]
      : []

    setUser({ username, email: emailAttr, roles })
    console.log('[Auth] Signed in:', { username, email: emailAttr, roles })
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    const { clearGuestCart } = await import('@/lib/cartUtils')
    clearGuestCart()
  }

  const isAdmin = user?.roles?.includes('admin') || false
  const isEmployee = user?.roles?.includes('employee') || false

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isEmployee,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
