import Link from 'next/link'

export default function DashboardLink() {
  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium">Panel de control</h2>
          <p className="text-sm text-zinc-500">Métricas, pedidos y productos en un solo lugar</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Abrir Dashboard ↗
        </Link>
      </div>
    </div>
  )
}
