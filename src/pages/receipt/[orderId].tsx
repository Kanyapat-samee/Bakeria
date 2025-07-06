'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getOrderById } from '@/lib/storeOrder'
import { format } from 'date-fns'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function ReceiptPage() {
  const { orderId } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof orderId !== 'string' || !user?.username?.trim()) return

    getOrderById(orderId, user.username.trim())
      .then((data) => {
        if (!data) {
          router.push('/orders')
        } else {
          setOrder(data)
        }
      })
      .catch((err) => {
        console.error('❌ Failed to fetch order:', err)
        router.push('/orders')
      })
      .finally(() => setLoading(false))
  }, [orderId, user])

  if (loading) return <p className="p-8">Loading receipt...</p>
  if (!order) return <p className="p-8 text-red-500">❌ Order not found.</p>

  const isDelivery = order.shipping.method === 'delivery'
  const shippingFee = isDelivery ? 50 : 0
  const subtotal = order.total - shippingFee

  return (
    <main className="min-h-screen bg-[#fef8ed] py-10 px-4 text-[#9c191d]">
      <div className="max-w-3xl mx-auto bg-white shadow-sm border border-[#e5d5cb] rounded-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-4 font-serif">Order Confirmed</h1>
        <p className="mb-6">Thank you! Your order has been placed successfully.</p>

        {/* Order Info */}
        <div className="space-y-1 text-sm border border-[#f1d8d8] p-4 rounded bg-[#fff7f3]">
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>Date:</strong> {format(new Date(order.createdAt), 'PPpp')}</p>
          <p><strong>Name:</strong> {order.shipping.name}</p>
          <p><strong>Phone:</strong> {order.shipping.phone}</p>
          <p><strong>Method:</strong> {isDelivery ? 'Home Delivery' : 'Pickup at Store'}</p>
          {isDelivery && <p><strong>Address:</strong> {order.shipping.address}</p>}
        </div>

        {/* Items */}
        <h2 className="mt-6 text-lg font-semibold">Order Items</h2>
        <ul className="divide-y mt-2 text-sm">
          {order.items.map((item: any) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>{item.name} × {item.quantity}</span>
              <span>฿{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-[#e5d5cb]" />

        {/* Totals */}
        <div className="text-right space-y-1 text-sm">
          <p>Subtotal: ฿{subtotal.toFixed(2)}</p>
          {isDelivery && <p>Shipping: ฿{shippingFee.toFixed(2)}</p>}
          <p className="text-lg font-bold text-[#9c191d]">
            Total: ฿{order.total.toFixed(2)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <Link href="/products">
            <button className="px-4 py-2 rounded-full border border-[#9c191d] text-[#9c191d] hover:bg-[#f8e8df] transition">
              Continue Shopping
            </button>
          </Link>
          <Link href="/orders">
            <button className="px-4 py-2 rounded-full bg-[#9c191d] text-white hover:opacity-90 transition">
              View My Orders
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}