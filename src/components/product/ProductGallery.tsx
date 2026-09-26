'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useLenis } from 'lenis/react'

export type GalleryImage = { url: string; alt: string }

type ProductGalleryProps = {
  images: GalleryImage[]
}

// Geometría del rollo. 'drum' = tambor 3D (las fotos giran alrededor de un cilindro);
// 'strip' = cinta plana continua (las fotos se deslizan pegadas, sin perspectiva).
const REEL_GEOMETRY: 'drum' | 'strip' = 'drum'
const IS_DRUM = REEL_GEOMETRY === 'drum'
const DRUM_STEP_DEG = 40 // grados de giro por foto; el radio se deriva de aquí
const DRUM_PERSPECTIVE_PX = 1500 // profundidad de cámara: más alto = curvatura más suave
const DRUM_MAX_VISIBLE_STEPS = 2.25 // 90°: más allá la cara mira hacia atrás
const WHEEL_PX_PER_PHOTO = 200 // delta de rueda que gira una foto (un notch ≈ 100px = media foto)
const WHEEL_LINE_HEIGHT_PX = 40 // deltaMode 1 (líneas, Firefox): 3 líneas ≈ un notch de mouse
const SWIPE_AXIS_SLOP_PX = 8 // recorrido mínimo para decidir el eje del gesto táctil

/** Transform de la foto que está a `distance` fotos de la posición actual del rollo. */
function reelTransform(distance: number, lateral: boolean, radius: number) {
  if (IS_DRUM && radius > 0) {
    const angle = distance * DRUM_STEP_DEG
    // `radius` = (lado/2)/tan(paso/2): con eso las caras contiguas se tocan sin hueco.
    // El signo hace que la foto siguiente entre desde abajo (desktop) o desde la derecha (móvil).
    return lateral
      ? `rotateY(${angle}deg) translateZ(${radius}px)`
      : `rotateX(${-angle}deg) translateZ(${radius}px)`
  }
  return lateral
    ? `translate3d(${distance * 100}%, 0, 0)`
    : `translate3d(0, ${distance * 100}%, 0)`
}

/** Escribe el estilo de una capa. No hay transición: el rollo obedece en el mismo frame. */
function applySlideStyle(slide: HTMLElement, distance: number, lateral: boolean, radius: number) {
  slide.style.transform = reelTransform(distance, lateral, radius)
  slide.style.visibility =
    IS_DRUM && Math.abs(distance) > DRUM_MAX_VISIBLE_STEPS ? 'hidden' : 'visible'
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  // En el layout móvil (o con puntero táctil) las fotos se desplazan en horizontal.
  const [lateralSlides, setLateralSlides] = useState(false)
  // Lado del panel sobre el que gira el tambor (alto si el rollo es vertical, ancho si es lateral).
  const [crossSize, setCrossSize] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const reelPosition = useRef(0) // posición del rollo en fotos (fraccionaria)
  const swipe = useRef<{ x: number; y: number; axis: 'x' | 'y' | null; start: number } | null>(null)
  const lenis = useLenis()
  const lastIndex = images.length - 1
  const radius = crossSize > 0 ? crossSize / 2 / Math.tan((DRUM_STEP_DEG * Math.PI) / 360) : 0

  /** Mueve el rollo a `value` fotos, sin animación, y deja el índice activo en la foto más cercana. */
  const moveReel = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(value, 0), lastIndex)
      reelPosition.current = clamped
      slideRefs.current.forEach((slide, index) => {
        if (slide) applySlideStyle(slide, index - clamped, lateralSlides, radius)
      })
      setActiveIndex(Math.round(clamped))
    },
    [lastIndex, lateralSlides, radius],
  )

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
    if (!panel || !IS_DRUM) return

    const observer = new ResizeObserver(([entry]) => {
      setCrossSize(lateralSlides ? entry.contentRect.width : entry.contentRect.height)
    })
    observer.observe(panel)
    return () => observer.disconnect()
  }, [lateralSlides])

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
      const next = Math.min(Math.max(reelPosition.current + delta / WHEEL_PX_PER_PHOTO, 0), lastIndex)

      if (next === reelPosition.current) {
        // El rollo ya está en un extremo: la página recupera el scroll.
        lenis?.start()
        return
      }

      event.preventDefault()
      lenis?.stop()
      moveReel(next)
    }

    panel.addEventListener('wheel', handleWheel, { passive: false })
    return () => panel.removeEventListener('wheel', handleWheel)
  }, [images.length, lastIndex, lenis, moveReel])

  // ReactLenis vive en el layout de (app) y sobrevive al cambio de ruta: liberar el scroll
  // al desmontar evita dejar la página congelada tras navegar con el puntero sobre la galería.
  useEffect(() => () => {
    lenis?.start()
  }, [lenis])

  // Deslizamiento táctil lateral: el eje vertical queda para el scroll de la página
  // (`touch-pan-y` en el panel), así que sólo consumimos los gestos en horizontal.
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (images.length < 2 || event.pointerType === 'mouse') return
    swipe.current = { x: event.clientX, y: event.clientY, axis: null, start: reelPosition.current }
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
    if (start.axis !== 'x') return

    // Arrastre 1:1 con el dedo: al soltar, el rollo se queda donde quedó.
    const span = panelRef.current?.clientWidth ?? 0
    if (span === 0) return
    moveReel(start.start - dx / span)
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
          lenis?.start()
        }}
        style={IS_DRUM ? { perspective: `${DRUM_PERSPECTIVE_PX}px` } : undefined}
        className="relative aspect-[4/5] w-full touch-pan-y overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-50 to-zinc-100 lg:aspect-[3/4]"
      >
        {images.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">Sin imagen</div>
        ) : (
          <div
            className="absolute inset-0"
            style={
              IS_DRUM
                ? { transformStyle: 'preserve-3d', transform: `translateZ(${-radius}px)` }
                : undefined
            }
          >
            {images.map((image, index) => (
              <div
                key={image.url}
                ref={(slide) => {
                  slideRefs.current[index] = slide
                  // El estilo se re-escribe en cada render desde la posición real del rollo:
                  // así un cambio de tamaño o de layout no descuadra las capas.
                  if (slide) applySlideStyle(slide, index - reelPosition.current, lateralSlides, radius)
                }}
                className="absolute inset-0 [backface-visibility:hidden]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex items-center gap-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                onClick={() => moveReel(index)}
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
