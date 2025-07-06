'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAdminAuth } from '@/context/AdminAuthContext'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const { signIn, isAdmin, isEmployee } = useAdminAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [requireNewPassword, setRequireNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password, requireNewPassword ? newPassword : undefined)

      if (!requireNewPassword) {
        if (isAdmin || isEmployee) {
          toast.success('Login successful!')
          router.push('/admin/orders')
        } else {
          toast.error('Access denied. Not an admin or employee.')
        }
      } else {
        toast.success('Password updated. Please log in again.')
        setRequireNewPassword(false)
        setPassword('')
        setNewPassword('')
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        const errorMsg = (err as { message?: string }).message
        if (errorMsg === 'NEW_PASSWORD_REQUIRED') {
          setRequireNewPassword(true)
          toast('New password required. Please set a new one.')
        } else {
          toast.error('Login failed. Check your credentials.')
          console.error(err)
        }
      } else {
        toast.error('An unknown error occurred.')
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fef8ed] px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#e5d5cb] shadow-sm rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-serif font-bold text-center text-[#9c191d] mb-6">
          Admin / Employee Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
          />
          <input
            type="password"
            placeholder={requireNewPassword ? 'Temporary Password' : 'Password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
          />
          {requireNewPassword && (
            <input
              type="password"
              placeholder="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#9c191d]"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9c191d] text-white py-2 rounded-full hover:opacity-90 transition"
          >
            {loading ? 'Processing...' : requireNewPassword ? 'Update Password' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  )
}