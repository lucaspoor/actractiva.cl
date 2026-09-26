'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'framer-motion'
import { useLenis } from 'lenis/react'

export type GalleryImage = { url: string; alt: string }

type ProductGalleryProps = {
  images: GalleryImage[]
}

const WHEEL_STEP_PX = 50 // delta acumulado (px) que cambia de foto
const WHEEL_STEP_COOLDOWN_MS = 160 // separación mínima entre dos cambios de foto
const WHEEL_LINE_HEIGHT_PX = 40 // deltaMode 1 (líneas, Firefox): 3 líneas ≈ un notch de mouse
const SWIPE_STEP_PX = 40 // recorrido lateral (px) que cambia de foto en táctil
const SWIPE_AXIS_SLOP_PX = 8 // recorrido mínimo para decidir el eje del gesto táctil

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  // En el layout móvil (o con puntero táctil) las fotos se desplazan en horizontal.
  const [lateralSlides, setLateralSlides] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const wheelAccumulator = useRef(0)
  const lastStepAt = useRef(0)
  const swipe = useRef<{ x: number; y: number; axis: 'x' | 'y' | null } | null>(null)
  const lenis = useLenis()
  const lastIndex = images.length - 1

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)') // breakpoint lg: cambia el layout a sticky
    const coarse = window.matchMedia('(pointer: coarse)')
    const sync = () => setLateralSlides(!wide.matches || coarse.matches)
    sync()
    wide.addEventListener('change', sync)
    coarse.addEventListener('change', sync)
    return () => {
      wide.removeEventListener('change', sync)
      coarse.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || images.length < 2) return

    const handleWheel = (event: WheelEvent) => {
      const delta =
        event.deltaMode === 1
          ? event.deltaY * WHEEL_LINE_HEIGHT_PX
          : event.deltaMode === 2
            ? event.deltaY * window.innerHeight
            : event.deltaY
      const next = activeIndex + (delta > 0 ? 1 : -1)

      if (next < 0 || next > lastIndex) {
        // No quedan fotos en esa dirección: la página recupera el scroll.
        wheelAccumulator.current = 0
        lenis?.start()
        return
      }

      event.preventDefault()
      lenis?.stop()

      wheelAccumulator.current += delta
      if (Math.abs(wheelAccumulator.current) < WHEEL_STEP_PX) return

      const now = event.timeStamp
      if (now - lastStepAt.current < WHEEL_STEP_COOLDOWN_MS) return

      wheelAccumulator.current = 0
      lastStepAt.current = now
      setActiveIndex(next)
    }

    panel.addEventListener('wheel', handleWheel, { passive: false })
    return () => panel.removeEventListener('wheel', handleWheel)
  }, [activeIndex, images.length, lastIndex, lenis])

  // ReactLenis vive en el layout de (app) y sobrevive al cambio de ruta: liberar el scroll
  // al desmontar evita dejar la página congelada tras navegar con el puntero sobre la galería.
  useEffect(() => () => {
    lenis?.start()
  }, [lenis])

  // Deslizamiento táctil lateral: el eje vertical queda para el scroll de la página
  // (`touch-pan-y` en el panel), así que sólo consumimos los gestos en horizontal.
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (images.length < 2 || event.pointerType === 'mouse') return
    swipe.current = { x: event.clientX, y: event.clientY, axis: null }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipe.current
    if (!start) return

    const dx = event.clientX - start.x
    if (!start.axis) {
      const dy = event.clientY - start.y
      if (Math.abs(dx) < SWIPE_AXIS_SLOP_PX && Math.abs(dy) < SWIPE_AXIS_SLOP_PX) return
      start.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
    if (start.axis !== 'x' || Math.abs(dx) < SWIPE_STEP_PX) return

    // Un paso por gesto: el dedo sigue apoyado, pero ya no encadena más fotos.
    swipe.current = null
    const next = activeIndex + (dx < 0 ? 1 : -1)
    if (next < 0 || next > lastIndex) return
    setActiveIndex(next)
  }

  const handlePointerEnd = () => {
    swipe.current = null
  }

  return (
    <div className="mx-auto w-full max-w-[720px] lg:w-[clamp(315px,calc((100vh-14rem)*0.75),100%)]">
      <div
        ref={panelRef}
        data-gallery-panel
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={() => {
          wheelAccumulator.current = 0
          lenis?.start()
        }}
        className="relative aspect-[4/5] w-full touch-pan-y overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-50 to-zinc-100 lg:aspect-[3/4]"
      >
        {images.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">Sin imagen</div>
        ) : (
          images.map((image, index) => {
            const offset = index === activeIndex ? '0%' : index < activeIndex ? '-14%' : '14%'
            return (
              <motion.div
                key={image.url}
                initial={false}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  scale: index === activeIndex ? 1 : 0.96,
                  x: lateralSlides ? offset : '0%',
                  y: lateralSlides ? '0%' : offset,
                }}
                className="absolute inset-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </motion.div>
            )
          })
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex items-center gap-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                onClick={() => {
                  wheelAccumulator.current = 0
                  setActiveIndex(index)
                }}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={index === activeIndex}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-zinc-50 transition-colors ${
                  index === activeIndex ? 'border-zinc-900' : 'border-transparent hover:border-zinc-300'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="h-full w-full object-contain p-1" />
              </button>
            ))}
          </div>
          <p className="ml-auto shrink-0 text-xs uppercase tracking-[0.25em] text-zinc-400">
            {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </p>
        </div>
      )}
    </div>
  )
}
