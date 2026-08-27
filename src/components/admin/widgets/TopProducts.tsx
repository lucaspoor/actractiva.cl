'use client'

import { useEffect, useState } from 'react'

type TopProduct = {
  title: string
  totalSold: number
  totalRevenue: number
}

function formatCLP(value: number): string {
  return `$ ${value.toLocaleString('es-CL')}`
}

export function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([])

  useEffect(() => {
    fetch('/api/analytics/top-products?limit=5')
      .then((r) => r.json())
      .then((json) => setProducts(json.products ?? []))
      .catch(console.error)
  }, [])

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6">
        <h3 className="mb-4 font-medium">Productos más vendidos</h3>
        <p className="text-sm text-zinc-400">Sin ventas registradas</p>
      </div>
    )
  }

  const maxRevenue = Math.max(...products.map((p) => p.totalRevenue))

  return (
    <div className="rounded-lg border border-zinc-200 p-6">
      <h3 className="mb-4 font-medium">Productos más vendidos</h3>
      <ul className="space-y-3">
        {products.map((product, i) => (
          <li key={product.title}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                  {i + 1}
                </span>
                {product.title}
              </span>
              <span className="text-zinc-500">
                {product.totalSold} uds · {formatCLP(product.totalRevenue)}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-zinc-900"
                style={{ width: `${(product.totalRevenue / maxRevenue) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
