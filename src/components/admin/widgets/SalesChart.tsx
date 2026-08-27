'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

type SalesPoint = {
  date: string
  sales: number
  orders: number
}

type Period = '7d' | '30d' | '90d'

function formatCLP(value: number): string {
  return `$ ${value.toLocaleString('es-CL')}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

export function SalesChart() {
  const [period, setPeriod] = useState<Period>('30d')
  const [data, setData] = useState<SalesPoint[]>([])

  useEffect(() => {
    fetch(`/api/analytics/sales-by-period?period=${period}`)
      .then((r) => r.json())
      .then((json) => setData(json.data ?? []))
      .catch(console.error)
  }, [period])

  return (
    <div className="rounded-lg border border-zinc-200 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">Ventas por período</h3>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {p === '7d' ? '7 días' : p === '30d' ? '30 días' : '90 días'}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
          Sin datos para este período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              tick={{ fontSize: 12, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value) => [formatCLP(Number(value)), 'Ventas']}
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e4e4e7',
                fontSize: '13px',
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#18181b"
              strokeWidth={2}
              fill="url(#salesGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
