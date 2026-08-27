'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '◈' },
  { href: '/dashboard/orders', label: 'Pedidos', icon: '◎' },
  { href: '/dashboard/products', label: 'Productos', icon: '◇' },
  { href: '/dashboard/settings', label: 'Ajustes', icon: '⚙' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          Atractiva
        </Link>
        <span className="ml-2 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
          ADMIN
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <span className="text-base">←</span>
          Volver a la tienda
        </Link>
      </div>
    </aside>
  )
}
