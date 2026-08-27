'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = {
  id: number
  title: string
  slug?: string | null
  price: number
  category?: string | null
  stock?: number | null
  featured?: boolean | null
  sizes?: string[] | null
}

function formatCLP(value: number): string {
  return `$ ${value.toLocaleString('es-CL')}`
}

const CATEGORY_LABELS: Record<string, string> = {
  polera: 'Polera',
  chaqueta: 'Chaqueta',
  pantalon: 'Pantalón',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?limit=50&sort=-createdAt')
      .then((r) => r.json())
      .then((json) => {
        setProducts(json.docs ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <Link
          href="/admin/collections/products"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          + Nuevo producto
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400">Cargando productos…</div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-zinc-400">Sin productos</div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Producto</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Categoría</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Precio</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Stock</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-500">Tallas</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-500">Destacado</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.title}</div>
                      <div className="text-xs text-zinc-400">/{product.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {CATEGORY_LABELS[product.category ?? ''] ?? product.category ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCLP(product.price)}</td>
                    <td className="px-4 py-3 text-right text-zinc-600">{product.stock ?? 0}</td>
                    <td className="px-4 py-3 text-center text-zinc-600">
                      {product.sizes?.join(', ') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.featured ? (
                        <span className="inline-block rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
                          Sí
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
