'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import { saveUserCart, loadUserCart } from '@/lib/userCart'

export type CartItem = {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isCartReady: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, isEmployee } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartReady, setIsCartReady] = useState(false)

  // 🛒 Load cart only for customer users
  useEffect(() => {
    const loadCart = async () => {
      if (!user?.username || isAdmin || isEmployee) {
        setCart([])
        setIsCartReady(true)
        return
      }

      try {
        const dbCart = await loadUserCart(user.username)
        setCart(dbCart)
      } catch (err) {
        console.error('❌ Failed to load cart from DynamoDB:', err)
      } finally {
        setIsCartReady(true)
      }
    }

    loadCart()
  }, [user, isAdmin, isEmployee])

  // 💾 Save cart for customers only
  useEffect(() => {
    if (!isCartReady || !user?.username || isAdmin || isEmployee) return

    saveUserCart(user.username, cart).catch((err) => {
      console.error('❌ Failed to save cart to DynamoDB:', err)
    })
  }, [cart, user, isCartReady, isAdmin, isEmployee])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === item.id)
      if (found) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartReady,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}