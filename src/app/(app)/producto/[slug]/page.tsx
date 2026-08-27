import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { SizeChart } from '@/components/product/SizeChart'
import { formatPrice, getMediaUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0]
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.title,
    description: product.description ?? undefined,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const media = product.images?.[0]?.image
  const imageUrl = getMediaUrl(typeof media === 'object' ? media : null, 'card')
  const alt = media && typeof media === 'object' ? (media.alt ?? product.title) : product.title

  const payload = await getPayload({ config })
  const sizeCharts = await payload.findGlobal({ slug: 'size-charts' })
  const categoryRows =
    product.category === 'polera'
      ? sizeCharts.polera?.rows
      : product.category === 'chaqueta'
        ? sizeCharts.chaqueta?.rows
        : sizeCharts.pantalon?.rows

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">Sin imagen</div>
        )}
      </div>

      <div className="flex flex-col justify-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.title}</h1>
        <p className="mt-3 text-xl text-zinc-600">{formatPrice(product.price)}</p>

        {product.description && (
          <p className="mt-6 leading-relaxed text-zinc-600">{product.description}</p>
        )}

        <div className="mt-8">
          <AddToCartButton
            item={{
              id: String(product.id),
              slug: String(product.slug ?? product.id),
              name: product.title,
              price: product.price,
              imageUrl,
            }}
            sizes={product.sizes ?? []}
          />
        </div>

        {product.category && categoryRows && categoryRows.length > 0 && (
          <SizeChart category={product.category} rows={categoryRows} />
        )}
      </div>
    </div>
  )
}
