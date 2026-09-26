'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { ProductGallery, type GalleryImage } from '@/components/product/ProductGallery'
import { CATEGORY_LABELS, SizeChart, type SizeChartRow } from '@/components/product/SizeChart'
import type { SiteInfoItem } from '@/lib/site-info'
import { formatPrice } from '@/lib/utils'

export type ProductExperienceProps = {
  product: {
    id: number
    slug: string
    title: string
    price: number
    description?: string | null
    category: 'polera' | 'chaqueta' | 'pantalon'
    sizes?: string[] | null
  }
  images: GalleryImage[]
  sizeRows: SizeChartRow[]
  fit: SiteInfoItem
  shipping: SiteInfoItem
  returns: SiteInfoItem
}

/**
 * Reparto de las secciones a los lados de la galería en desktop: el índice par va a la
 * columna derecha y el impar a la izquierda, y la columna derecha baja media sección para
 * lograr el ritmo en zigzag entre ambos lados.
 */
const SECTION_LAYOUT = [
  'lg:col-start-3 lg:row-start-1 lg:pr-8 lg:mt-[16vh]',
  'lg:col-start-1 lg:row-start-2 lg:pl-8',
  'lg:col-start-3 lg:row-start-2 lg:pr-8 lg:mt-[16vh]',
  'lg:col-start-1 lg:row-start-3 lg:pl-8',
  'lg:col-start-3 lg:row-start-3 lg:pr-8 lg:mt-[16vh]',
  'lg:col-start-1 lg:row-start-4 lg:pl-8',
  'lg:col-start-3 lg:row-start-4 lg:pr-8 lg:mt-[16vh]',
  'lg:col-start-1 lg:row-start-5 lg:pl-8',
]

const ROW_SPAN = ['lg:row-span-1', 'lg:row-span-2', 'lg:row-span-3', 'lg:row-span-4', 'lg:row-span-5']

function NarrativeSection({
  index,
  title,
  placement,
  children,
}: {
  index: number
  title: string
  placement: string
  children: ReactNode
}) {
  return (
    <motion.section className={`border-t border-zinc-100 py-8 ${placement}`}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="mb-3 text-base font-medium">{title}</h2>
        <div className="text-[13px] leading-relaxed text-zinc-600">{children}</div>
      </motion.div>
    </motion.section>
  )
}

export function ProductExperience({
  product,
  images,
  sizeRows,
  fit,
  shipping,
  returns,
}: ProductExperienceProps) {
  const rawSections: { key: string; title: string; body: ReactNode }[] = []

  if (product.description) {
    rawSections.push({
      key: 'description',
      title: 'Descripción',
      body: <p>{product.description}</p>,
    })
  }

  rawSections.push({
    key: 'sizes',
    title: `Guía de tallas — ${CATEGORY_LABELS[product.category]}`,
    body: (
      <>
        <p>{fit.content}</p>
        {sizeRows.length > 0 ? (
          <div className="mt-4">
            <SizeChart category={product.category} rows={sizeRows} />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-[11px] text-zinc-600"
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}
            <p className="text-zinc-500">
              Aún no publicamos la tabla de medidas. Escríbenos a hola@atractivacl.cl y te ayudamos a
              elegir.
            </p>
          </div>
        )}
      </>
    ),
  })

  rawSections.push({ key: 'shipping', title: shipping.title, body: <p>{shipping.content}</p> })
  rawSections.push({ key: 'returns', title: returns.title, body: <p>{returns.content}</p> })

  const sections = rawSections.map((section, index) => ({ ...section, index }))

  // La galería ocupa tantas filas como necesita la narrativa (bloque de compra + secciones).
  const narrativeRows = 1 + Math.ceil(sections.length / 2)
  const rowSpanClass = ROW_SPAN[Math.min(narrativeRows, ROW_SPAN.length) - 1]

  const infoRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: infoRef, offset: ['start start', 'end center'] })
  const railScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <div
      ref={infoRef}
      className="relative mx-auto grid w-full max-w-[1500px] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-0 lg:py-16"
    >
      <div
        className={`lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:self-start ${rowSpanClass}`}
      >
        <ProductGallery images={images} />
      </div>

      <div className="absolute left-0 top-0 hidden h-full w-px bg-zinc-100 lg:block">
        <motion.div className="h-full w-px origin-top bg-zinc-900" style={{ scaleY: railScale }} />
      </div>

      <div className="pb-10 lg:col-start-1 lg:row-start-1 lg:pl-8">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-zinc-400">
          {CATEGORY_LABELS[product.category]}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.title}</h1>
        <p className="mt-3 text-xl text-zinc-600">{formatPrice(product.price)}</p>
        <div className="mt-8">
          <AddToCartButton
            item={{
              id: String(product.id),
              slug: product.slug,
              name: product.title,
              price: product.price,
              imageUrl: images[0]?.url,
            }}
            sizes={product.sizes ?? []}
          />
        </div>
      </div>

      {sections.map((section) => (
        <NarrativeSection
          key={section.key}
          index={section.index}
          title={section.title}
          placement={SECTION_LAYOUT[section.index % SECTION_LAYOUT.length]}
        >
          {section.body}
        </NarrativeSection>
      ))}
    </div>
  )
}
