'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  signIn,
  confirmSignIn,
  signOut,
  fetchAuthSession,
} from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'
import { useRouter } from 'next/navigation'
import { amplifyAdminConfig } from '@/lib/amplifyAdminConfig'

Amplify.configure(amplifyAdminConfig)

type User = {
  username: string
  email: string
  roles: string[]
} | null

type AdminAuthContextType = {
  user: User
  isLoading: boolean
  isAdmin: boolean
  isEmployee: boolean
  signIn: (email: string, password: string, newPassword?: string) => Promise<void>
  signOut: () => Promise<void>
  getAccessToken: () => Promise<string>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: true })
        const token = session.tokens?.idToken?.payload
        const creds = session.credentials

        if (!token || !creds) {
          console.warn('[AdminAuth] No credentials or token')
          setUser(null)
          return
        }

        const emailRaw = token.email
        const nameRaw = token.name

        const email = typeof emailRaw === 'string' ? emailRaw : String(emailRaw ?? '')
        const name = typeof nameRaw === 'string' ? nameRaw : ''

        const username = name || email.split('@')[0] || 'User'
        const rawGroups = token['cognito:groups']
        const roles = Array.isArray(rawGroups)
          ? rawGroups
              .filter((r): r is string => typeof r === 'string') // ✅ กรองเฉพาะ string
              .map((r) => r.toLowerCase())
          : []

        setUser({ username, email, roles })
        console.log('[AdminAuth] Loaded user:', { username, email, roles })
      } catch (err) {
        console.warn('[AdminAuth] No active session:', err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleSignIn = async (email: string, password: string, newPassword?: string) => {
    try {
      await signOut()
    } catch {}

    const result = await signIn({ username: email, password })

    if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      if (!newPassword) throw new Error('NEW_PASSWORD_REQUIRED')
      await confirmSignIn({ challengeResponse: newPassword })
    }

    const session = await fetchAuthSession({ forceRefresh: true })
    const token = session.tokens?.idToken?.payload

    const emailRaw = token?.email
    const nameRaw = token?.name

    const emailAttr = typeof emailRaw === 'string' ? emailRaw : String(emailRaw ?? '')
    const name = typeof nameRaw === 'string' ? nameRaw : ''
    const username = name || emailAttr.split('@')[0] || 'User'

    const rawGroups = token?.['cognito:groups']
    const roles = Array.isArray(rawGroups)
      ? rawGroups
          .filter((r): r is string => typeof r === 'string') // ✅ กรองเฉพาะ string
          .map((r) => r.toLowerCase())
      : []
    setUser({ username, email: emailAttr, roles })
    console.log('[AdminAuth] Signed in:', { username, email: emailAttr, roles })
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    router.replace('/admin/login')
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
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isEmployee,
        signIn: handleSignIn,
        signOut: handleSignOut,
        getAccessToken,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return context
}