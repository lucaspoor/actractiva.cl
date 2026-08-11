import { Suspense } from 'react'

import { GraciasContent } from './GraciasContent'

export const dynamic = 'force-dynamic'

export default function GraciasPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-zinc-400">Cargando…</div>}>
      <GraciasContent />
    </Suspense>
  )
}
