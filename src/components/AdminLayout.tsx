'use client'

import Link from 'next/link'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useRouter } from 'next/router'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAdminAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-[#fef8ed] text-[#9c191d] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e5d5cb] shadow-md px-6 py-8 rounded-tr-3xl rounded-br-3xl flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#9c191d] mb-6">
            Admin Panel
          </h2>
          <nav className="space-y-3">
            <Link
              href="/admin/orders"
              className="block text-sm px-4 py-2 rounded-full bg-transparent text-[#5c1c1d] hover:bg-[#f3dcd9] hover:text-[#9c191d] transition"
            >
              📦 Orders
            </Link>
            {user?.roles?.includes('admin') && (
              <Link
                href="/admin/dashboard"
                className="block text-sm px-4 py-2 rounded-full bg-transparent text-[#5c1c1d] hover:bg-[#f3dcd9] hover:text-[#9c191d] transition"
              >
                📊 Dashboard
              </Link>
            )}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-fit text-sm bg-[#9c191d] text-[#fef8ed] px-4 py-2 rounded-full hover:opacity-90 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 bg-[#fef8ed] rounded-tl-3xl overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
