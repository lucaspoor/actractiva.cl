'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const items = useCartStore((s) => s.items)
  const closeCart = useCartStore((s) => s.closeCart)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const total = useCartStore((s) => s.totalPrice())

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-label="Carrito">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={closeCart}
        className="absolute inset-0 bg-zinc-900/30"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Tu carrito</h2>
          <button type="button" onClick={closeCart} aria-label="Cerrar" className="text-2xl leading-none">
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-500">Tu carrito está vacío.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-20 w-16 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-20 w-16 shrink-0 rounded bg-zinc-100" />
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.size && <p className="text-xs text-zinc-500">Talla {item.size}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 rounded border border-zinc-300 text-xs"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 rounded border border-zinc-300 text-xs"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Eliminar ${item.name}`}
                          className="text-xs text-zinc-400 hover:text-zinc-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-zinc-200 px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Total</span>
            <span className="text-lg font-semibold">{formatPrice(total)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className={`block w-full rounded-full border border-zinc-900 py-3 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 ${
              items.length === 0 ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            Ir a pagar
          </Link>
        </footer>
      </aside>
    </div>
  )
}
