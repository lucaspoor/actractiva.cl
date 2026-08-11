'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import Link from 'next/link'

import { formatPrice } from '@/lib/utils'

export type ShowcaseProduct = {
  id: number
  title: string
  slug: string
  price: number
  sizes?: string[]
  images?: { image?: { url?: string | null } | null }[] | null
}

type ScrollShowcaseProps = {
  products: ShowcaseProduct[]
}

function ShowcaseCard({
  product,
  progress,
  index,
  count,
}: {
  product: ShowcaseProduct
  progress: MotionValue<number>
  index: number
  count: number
}) {
  const start = index
  const end = Math.min(start + 1, count - 1)

  const y = useTransform(progress, [start, end], [80, 0])
  const scale = useTransform(progress, [start, end], [0.94, 1])
  const opacity = useTransform(progress, [start, end, end + 1], [0.2, 1, 1])

  const imageUrl = product.images?.[0]?.image?.url

  return (
    <motion.article
      style={{ y, scale, opacity }}
      className="grid gap-6 md:grid-cols-2 md:items-center"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            Sin imagen
          </div>
        )}
      </div>
      <div className="md:pl-10">
        <h3 className="text-2xl font-semibold tracking-tight">{product.title}</h3>
        <p className="mt-2 text-lg text-zinc-600">{formatPrice(product.price)}</p>
        {product.sizes && product.sizes.length > 0 && (
          <p className="mt-4 text-sm text-zinc-500">Tallas: {product.sizes.join(' · ')}</p>
        )}
        <Link
          href={`/producto/${product.slug}`}
          className="mt-8 inline-block rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium transition-colors hover:bg-zinc-100"
        >
          Ver producto
        </Link>
      </div>
    </motion.article>
  )
}

/**
 * Galería de productos con transiciones ligadas al scroll:
 * la tarjeta activa (según progreso de scroll) se eleva y escala,
 * mientras las anteriores/nuevas se desplazan y difuminan.
 */
export function ScrollShowcase({ products }: ScrollShowcaseProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const progress = useTransform(scrollYProgress, [0, 1], [0, products.length - 1])

  if (products.length === 0) {
    return (
      <section className="px-4 py-24 text-center">
        <h2 className="mb-2 text-2xl font-semibold">Colección</h2>
        <p className="text-zinc-500">
          Aún no hay productos publicados. Agrégalos desde el panel en <code>/admin</code>.
        </p>
      </section>
    )
  }

  return (
    <section id="coleccion" ref={ref} className="relative">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-10 text-2xl font-semibold tracking-tight sm:text-3xl">Colección</h2>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        {products.map((product, index) => (
          <ShowcaseCard
            key={product.id}
            product={product}
            progress={progress}
            index={index}
            count={products.length}
          />
        ))}
      </div>
    </section>
  )
}
