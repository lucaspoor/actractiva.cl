'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

import { formatPrice } from '@/lib/utils'

export type CompleteLookProduct = {
  slug: string
  title: string
  price: number
  imageUrl?: string
}

export function CompleteLook({ products }: { products: CompleteLookProduct[] }) {
  if (products.length === 0) return null

  return (
    <section className="border-t border-zinc-200">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-20 sm:px-6">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">Completa el look</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {products.map((product, index) => (
            <motion.article
              key={product.slug}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group w-full sm:w-[380px]"
            >
              <Link href={`/producto/${product.slug}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-50 to-zinc-100">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-medium">{product.title}</h3>
                  <p className="text-sm text-zinc-600">{formatPrice(product.price)}</p>
                </div>
                <p className="mt-2 text-sm text-zinc-500 underline-offset-4 group-hover:underline">
                  Ver producto
                </p>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
