'use client'

import { useState } from 'react'

import { useCartStore } from '@/store/useCartStore'
import type { CartItem } from '@/store/useCartStore'

type AddToCartButtonProps = {
  item: Omit<CartItem, 'quantity'>
  sizes?: string[]
}

export function AddToCartButton({ item, sizes }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes?.[0])
  const [quantity, setQuantity] = useState(1)

  const handleAdd = () => {
    addItem({
      ...item,
      size: selectedSize,
      quantity,
    })
  }

  return (
    <div className="space-y-5">
      {sizes && sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Talla: {selectedSize ?? '—'}</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-10 min-w-10 rounded-full border px-3 text-sm transition-colors ${
                  selectedSize === size
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-zinc-300 hover:border-zinc-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 rounded-full border border-zinc-300"
          >
            −
          </button>
          <span className="w-8 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-10 w-10 rounded-full border border-zinc-300"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 rounded-full border border-zinc-900 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}
