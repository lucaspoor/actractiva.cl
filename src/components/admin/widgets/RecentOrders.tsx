'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: number
  orderNumber?: string | null
  status?: string | null
  flowEnv?: string | null
  total?: number | null
  customer: { name: string; email: string }
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RecentOrders({ flowEnv }: { flowEnv: string }) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetch(`/api/analytics/recent-orders?flowEnv=${flowEnv}`)
      .then((r) => r.json())
      .then((json) => setOrders(json.orders ?? []))
      .catch(console.error)
  }, [flowEnv])

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6">
        <h3 className="mb-4 font-medium">Pedidos recientes</h3>
        <p className="text-sm text-zinc-400">Sin pedidos aún</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-6">
      <h3 className="mb-4 font-medium">Pedidos recientes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="pb-2 text-left font-medium text-zinc-500">Orden</th>
              <th className="pb-2 text-left font-medium text-zinc-500">Cliente</th>
              <th className="pb-2 text-right font-medium text-zinc-500">Total</th>
              <th className="pb-2 text-center font-medium text-zinc-500">Estado</th>
              <th className="pb-2 text-right font-medium text-zinc-500">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-zinc-50">
                <td className="py-2 font-mono text-xs">
                  <span>{order.orderNumber ?? `#${order.id}`}</span>
                  {order.flowEnv === 'sandbox' && (
                    <span className="ml-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      TEST
                    </span>
                  )}
                </td>
                <td className="py-2">{order.customer.name}</td>
                <td className="py-2 text-right">{formatCLP(order.total ?? 0)}</td>
                <td className="py-2 text-center">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status ?? 'pending'] ?? STATUS_STYLES.pending}`}
                  >
                    {STATUS_LABELS[order.status ?? 'pending'] ?? order.status}
                  </span>
                </td>
                <td className="py-2 text-right text-zinc-500">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
