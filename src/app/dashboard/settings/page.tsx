import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ajustes',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 font-medium">Integraciones</h2>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li className="flex items-center justify-between">
              <span>Google Analytics</span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">Pendiente</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Meta Pixel</span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">Pendiente</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Flow (pagos)</span>
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Activo</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Resend (email)</span>
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Activo</span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 font-medium">Cuenta</h2>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li className="flex items-center justify-between">
              <span>Admin de Payload</span>
              <Link href="/admin" className="text-zinc-900 underline hover:no-underline">
                Abrir ↗
              </Link>
            </li>
            <li className="flex items-center justify-between">
              <span>Tabla de tallas</span>
              <Link href="/admin/globals/size-charts" className="text-zinc-900 underline hover:no-underline">
                Editar ↗
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
