'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { useCartStore } from '@/store/useCartStore'

/**
 * Pantalla de éxito tras el retorno desde Flow (urlReturn).
 * Vacía el carrito una única vez y muestra la referencia de la orden.
 */
export function GraciasContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const orderCleared = useCartStore((s) => s.orderCleared)
  const clearCart = useCartStore((s) => s.clearCart)
  const markOrderCleared = useCartStore((s) => s.markOrderCleared)

  useEffect(() => {
    if (!orderCleared) {
      clearCart()
      markOrderCleared()
    }
  }, [orderCleared, clearCart, markOrderCleared])

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">¡Gracias por tu compra!</h1>
      <p className="mt-4 text-zinc-600">
        Tu pago fue procesado y te enviaremos un correo de confirmación con los detalles de tu
        orden.
      </p>
      {token && (
        <p className="mt-6 rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-500">
          Referencia del pago: <span className="font-mono">{token}</span>
        </p>
      )}
      <Link
        href="/"
        className="mt-10 inline-block rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium hover:bg-zinc-100"
      >
        Volver a la tienda
      </Link>
    </div>
  )
}
