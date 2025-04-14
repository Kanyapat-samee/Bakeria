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
  getAccessToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: true })
        const idToken = session.tokens?.idToken?.payload

        const rawEmail = idToken?.email
        if (!rawEmail) {
          setUser(null)
          return
        }

        const email = String(rawEmail)
        const rawName = idToken?.name
        const name = typeof rawName === 'string' ? rawName : String(rawName ?? '')
        const username = name || (email.includes('@') ? email.split('@')[0] : '') || 'User'

        const rawGroups = idToken?.['cognito:groups'] ?? []
        const roles: string[] = Array.isArray(rawGroups)
          ? rawGroups.map((g) =>
              typeof g === 'string' ? g.toLowerCase() : String(g).toLowerCase()
            )
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
    const session = await fetchAuthSession({ forceRefresh: true })
    const idToken = session.tokens?.idToken?.payload

    const rawEmail = idToken?.email
    if (!rawEmail) {
      setUser(null)
      return
    }

    const emailAttr = String(rawEmail)
    const rawName = idToken?.name
    const name = typeof rawName === 'string' ? rawName : String(rawName ?? '')
    const username = name || (emailAttr.includes('@') ? emailAttr.split('@')[0] : '') || 'User'

    const rawGroups = idToken?.['cognito:groups'] ?? []
    const roles: string[] = Array.isArray(rawGroups)
      ? rawGroups.map((g) =>
          typeof g === 'string' ? g.toLowerCase() : String(g).toLowerCase()
        )
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

  const getAccessToken = async (): Promise<string> => {
    try {
      const session = await fetchAuthSession({ forceRefresh: true })
      const token = session.tokens?.accessToken?.toString()

      if (!token || typeof token !== 'string' || token.trim().length < 1) {
        console.error('[getAccessToken] Invalid access token:', token)
        throw new Error('No valid access token available')
      }

      return token
    } catch (err) {
      console.error('[getAccessToken] Failed to fetch access token:', err)
      throw new Error('Failed to fetch access token')
    }
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
        getAccessToken,
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