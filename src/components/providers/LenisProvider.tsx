'use client'

import { ReactLenis } from 'lenis/react'

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ smoothWheel: true, lerp: 0.1, wheelMultiplier: 1 }}>
      {children}
    </ReactLenis>
  )
}
