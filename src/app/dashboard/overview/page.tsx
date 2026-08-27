'use client'

import { useState } from 'react'

import { SalesOverview } from '@/components/admin/widgets/SalesOverview'
import { SalesChart } from '@/components/admin/widgets/SalesChart'
import { RecentOrders } from '@/components/admin/widgets/RecentOrders'
import { TopProducts } from '@/components/admin/widgets/TopProducts'

const ENV_OPTIONS = [
  { label: 'Producción', value: 'production' },
  { label: 'Test', value: 'sandbox' },
]

export default function OverviewPage() {
  const [flowEnv, setFlowEnv] = useState('production')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Entorno:</span>
          <div className="flex gap-1 rounded-lg bg-zinc-100 p-0.5">
            {ENV_OPTIONS.map((opt) => (
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
      </div>

      <SalesOverview flowEnv={flowEnv} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart flowEnv={flowEnv} />
        <TopProducts flowEnv={flowEnv} />
      </div>

      <RecentOrders flowEnv={flowEnv} />
    </div>
  )
}
