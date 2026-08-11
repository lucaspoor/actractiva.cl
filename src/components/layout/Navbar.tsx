import Link from 'next/link'

import { CartButton } from '@/components/cart/CartButton'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Atractiva
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/#coleccion" className="hidden hover:underline sm:inline">
            Colección
          </Link>
          <Link href="/#guia" className="hidden hover:underline sm:inline">
            Guía de tallas
          </Link>
          <CartButton />
        </div>
      </nav>
    </header>
  )
}
