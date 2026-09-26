import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { CompleteLook, type CompleteLookProduct } from '@/components/product/CompleteLook'
import { ProductExperience } from '@/components/product/ProductExperience'
import type { GalleryImage } from '@/components/product/ProductGallery'
import type { SizeChartRow } from '@/components/product/SizeChart'
import { SITE_INFO } from '@/lib/site-info'
import { getMediaUrl } from '@/lib/utils'

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

  const payload = await getPayload({ config })

  const images: GalleryImage[] = (product.images ?? []).flatMap((entry) => {
    const media = typeof entry.image === 'object' ? entry.image : null
    const url = getMediaUrl(media, 'card')
    return url ? [{ url, alt: media?.alt ?? product.title }] : []
  })

  const sizeCharts = await payload.findGlobal({ slug: 'size-charts' })
  const categoryRows =
    product.category === 'polera'
      ? sizeCharts.polera?.rows
      : product.category === 'chaqueta'
        ? sizeCharts.chaqueta?.rows
        : sizeCharts.pantalon?.rows

  const { docs: others } = await payload.find({
    collection: 'products',
    where: { id: { not_equals: product.id } },
    depth: 1,
    limit: 2,
    sort: 'createdAt',
  })

  const otherProducts: CompleteLookProduct[] = others.map((other) => {
    const media = other.images?.[0]?.image
    return {
      slug: String(other.slug ?? other.id),
      title: other.title,
      price: other.price,
      imageUrl: getMediaUrl(typeof media === 'object' ? media : null, 'card'),
    }
  })

  return (
    <>
      <ProductExperience
        product={{
          id: product.id,
          slug: String(product.slug ?? product.id),
          title: product.title,
          price: product.price,
          description: product.description,
          category: product.category,
          sizes: product.sizes ?? [],
        }}
        images={images}
        sizeRows={(categoryRows ?? []) as SizeChartRow[]}
        fit={SITE_INFO.fit}
        shipping={SITE_INFO.shipping}
        returns={SITE_INFO.returns}
      />
      <CompleteLook products={otherProducts} />
    </>
  )
}
