import { useCart } from '@/context/CartContext'
import toast from 'react-hot-toast'

type Props = {
  id: string
  name: string
  price: number
  imageUrl: string
}

export default function ProductCard({ id, name, price, imageUrl }: Props) {
  const { addToCart } = useCart()

  return (
    <div className="rounded-xl border shadow-md p-4 bg-white flex flex-col">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-48 object-cover rounded-md"
      />
      <h3 className="mt-3 font-semibold text-lg text-gray-800">{name}</h3>
      <p className="text-pink-600 font-bold mb-2">฿{price.toFixed(2)}</p>
      <button
        onClick={() => {
          addToCart({ id, name, price, imageUrl })
          toast.success(`${name} added to cart`)
        }}
        className="mt-auto bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
      >
        Add to Cart
      </button>
    </div>
  )
}
