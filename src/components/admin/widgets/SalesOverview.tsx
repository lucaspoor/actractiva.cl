'use client'

import { useEffect, useState } from 'react'

type SummaryData = {
  totalSales: number
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  averageTicket: number
}

function formatCLP(value: number): string {
  return `$ ${value.toLocaleString('es-CL')}`
}

export function SalesOverview({ flowEnv }: { flowEnv: string }) {
  const [data, setData] = useState<SummaryData | null>(null)

  useEffect(() => {
    fetch(`/api/analytics/summary?flowEnv=${flowEnv}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
  }, [flowEnv])

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 p-6 animate-pulse">
            <div className="h-4 w-20 rounded bg-zinc-100" />
            <div className="mt-2 h-8 w-32 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Ventas totales', value: formatCLP(data.totalSales) },
    { label: 'Pedidos totales', value: String(data.totalOrders) },
    { label: 'Ticket promedio', value: formatCLP(data.averageTicket) },
    { label: 'Pagados / Pendientes', value: `${data.paidOrders} / ${data.pendingOrders}` },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
