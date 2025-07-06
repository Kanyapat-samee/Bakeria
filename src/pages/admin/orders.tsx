'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { getAllOrders, updateOrderStatus } from '@/lib/adminStoreOrder'
import { format } from 'date-fns'

type Order = {
  orderId: string
  userId: string
  createdAt: string
  total: number
  shipping: {
    name: string
    phone: string
    address?: string
    method: 'delivery' | 'pickup'
  }
  items: { id: string; name: string; quantity: number; price: number }[]
  status: string
}

export default function AdminOrdersPage() {
  const { isAdmin, isEmployee, isLoading } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedType, setSelectedType] = useState<'delivery' | 'pickup'>('delivery')

  const getTodayBangkok = () => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    return formatter.format(new Date())
  }

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayBangkok())
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !(isAdmin || isEmployee)) {
      router.replace('/')
    }
  }, [isAdmin, isEmployee, isLoading, router])

  useEffect(() => {
    const fetch = async () => {
      try {
        const all = await getAllOrders()
        setOrders(all)
      } catch (err: unknown) {
        console.error('Failed to load orders:', err)
      }
    }

    if (isAdmin || isEmployee) fetch()
  }, [isAdmin, isEmployee])

  const filtered = orders.filter((o) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const orderDate = formatter.format(new Date(o.createdAt))
    return o.shipping.method === selectedType && orderDate === selectedDate
  })

  const renderTable = (orders: Order[]) => (
    <div className="overflow-x-auto rounded-xl border border-[#e4cfc3] shadow bg-white mb-6">
      <table className="w-full text-sm">
        <thead className="bg-[#f3e6dd] text-left text-[#9c191d] rounded-t-xl">
          <tr>
            <th className="p-3 rounded-tl-xl">Order ID</th>
            <th className="p-3">Recipient</th>
            <th className="p-3">Phone</th>
            {selectedType === 'delivery' && <th className="p-3">Address</th>}
            <th className="p-3">Items</th>
            <th className="p-3">Total</th>
            <th className="p-3 rounded-tr-xl">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId} className="border-t hover:bg-[#fff4f2] transition">
              <td className="p-3 font-mono">{order.orderId.slice(0, 8)}...</td>
              <td className="p-3">{order.shipping.name}</td>
              <td className="p-3">{order.shipping.phone}</td>
              {selectedType === 'delivery' && (
                <td className="p-3">{order.shipping.address}</td>
              )}
              <td className="p-3">
                <ul className="list-disc pl-4 space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="p-3 text-[#9c191d] font-semibold">
                ฿{order.total.toFixed(2)}
              </td>
              <td className="p-3 w-32 whitespace-nowrap">
                <select
                  className="border border-gray-300 px-2 py-1 rounded-full bg-[#fef8ed] text-sm focus:ring-1 focus:ring-[#9c191d]"
                  defaultValue={order.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value
                    await updateOrderStatus(order.userId, order.orderId, newStatus)
                    setOrders((prev) =>
                      prev.map((o) =>
                        o.orderId === order.orderId ? { ...o, status: newStatus } : o
                      )
                    )
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="In progress">In progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Ready">Ready</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <AdminLayout>
      <div className="bg-[#fef8ed] min-h-screen px-4 py-8 rounded-xl">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-serif font-bold text-[#9c191d]">
            {selectedType === 'delivery' ? '🚚 Delivery Orders' : '🏬 Pickup Orders'}
          </h1>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-[#d2b7a3] rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-[#9c191d]"
            />
            <button
              onClick={() => setSelectedType('delivery')}
              className={`px-4 py-1 rounded-full font-medium transition ${
                selectedType === 'delivery'
                  ? 'bg-[#9c191d] text-white'
                  : 'bg-[#f3e6dd] text-[#9c191d]'
              }`}
            >
              Delivery
            </button>
            <button
              onClick={() => setSelectedType('pickup')}
              className={`px-4 py-1 rounded-full font-medium transition ${
                selectedType === 'pickup'
                  ? 'bg-[#9c191d] text-white'
                  : 'bg-[#f3e6dd] text-[#9c191d]'
              }`}
            >
              Pickup
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-600 italic">
            No {selectedType} orders found on{' '}
            {format(new Date(selectedDate), 'dd-MM-yyyy')}.
          </p>
        ) : (
          renderTable(filtered)
        )}
      </div>
    </AdminLayout>
  )
}