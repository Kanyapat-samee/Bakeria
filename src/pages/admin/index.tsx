'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminIndex() {
  const router = useRouter()
  const { isLoading, isAdmin, isEmployee } = useAdminAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAdmin || isEmployee) {
      router.replace('/admin/orders')
    } else {
      router.replace('/admin/login') // fallback for unauthorized access
    }
  }, [isAdmin, isEmployee, isLoading, router])

  return (
    <div className="p-6 text-sm text-gray-600">
      {isLoading ? 'Checking access...' : 'Redirecting...'}
    </div>
  )
}