'use client'

import { useHydrated } from '@/components/providers/CartProvider'
import { useCartStore } from '@/store/useCartStore'

export function CartButton() {
  const hydrated = useHydrated()
  const openCart = useCartStore((s) => s.openCart)
  const count = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0))

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Abrir carrito"
      className="relative inline-flex items-center gap-1 font-medium hover:underline"
    >
      Carrito
      {hydrated && count > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-100 border border-zinc-300 px-1 text-[10px] font-semibold leading-none text-zinc-900">
          {count}
        </span>
      )}
    </button>
  )
}
