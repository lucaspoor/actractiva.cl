'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: number
  orderNumber?: string | null
  status?: string | null
  flowEnv?: string | null
  total?: number | null
  customer: { name: string; email: string; phone?: string | null }
  items?: { name: string; size?: string | null; quantity: number; price: number }[]
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

function formatCLP(value: number): string {
  return `$ ${value.toLocaleString('es-CL')}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [flowEnv, setFlowEnv] = useState('production')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/analytics/recent-orders?flowEnv=${flowEnv}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setOrders(json.orders ?? [])
          setInitialLoad(false)
        }
      })
      .catch(() => { if (!cancelled) setInitialLoad(false) })
    return () => { cancelled = true }
  }, [flowEnv])

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Entorno:</span>
            <div className="flex gap-1 rounded-lg bg-zinc-100 p-0.5">
              {[
                { label: 'Producción', value: 'production' },
                { label: 'Test', value: 'sandbox' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFlowEnv(opt.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    flowEnv === opt.value
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'rejected', 'cancelled'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === f
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {f === 'all' ? 'Todos' : STATUS_LABELS[f] ?? f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {initialLoad ? (
        <div className="py-20 text-center text-zinc-400">Cargando pedidos…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-400">Sin pedidos para este filtro</div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Orden</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Productos</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-zinc-500">Estado</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{order.orderNumber ?? `#${order.id}`}</span>
                      {order.flowEnv === 'sandbox' && (
                        <span className="ml-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          TEST
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-zinc-400">{order.customer.email}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {order.items?.map((item) => (
                        <div key={item.name}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCLP(order.total ?? 0)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status ?? 'pending'] ?? STATUS_STYLES.pending}`}
                      >
                        {STATUS_LABELS[order.status ?? 'pending'] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500">{formatDate(order.createdAt)}</td>
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
