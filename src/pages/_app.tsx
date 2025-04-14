// /pages/_app.tsx
'use client'

import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { AuthProvider } from '@/context/AuthContext'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAdminRoute = router.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <AdminAuthProvider>
        <Component {...pageProps} />
      </AdminAuthProvider>
    )
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Toaster position="bottom-center" />
        <Component {...pageProps} />
      </CartProvider>
    </AuthProvider>
  )
}
