'use client'

import { createContext, useContext } from 'react'

import { useCartStore } from '@/store/useCartStore'

const HydratedContext = createContext(false)

/**
 * Provee el flag `hydrated` para evitar discrepancias SSR/hidratación
 * cuando se lee el carrito persistido en localStorage.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useCartStore((s) => s.hydrated)

  return <HydratedContext.Provider value={hydrated}>{children}</HydratedContext.Provider>
}

export function useHydrated() {
  return useContext(HydratedContext)
}
