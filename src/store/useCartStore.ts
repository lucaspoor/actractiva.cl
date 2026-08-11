'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  size?: string
  imageUrl?: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
  hydrated: boolean
  setHydrated: () => void
  orderCleared: boolean
  markOrderCleared: () => void
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      orderCleared: false,
      markOrderCleared: () => set({ orderCleared: true }),

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                : i,
            ),
          })
        } else {
          set({ items: [...get().items, { ...item, quantity: item.quantity ?? 1 }] })
        }

        set({ isOpen: true })
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) =>
        set({
          items:
            quantity <= 0
              ? get().items.filter((i) => i.id !== id)
              : get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'atractiva-cart',
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)
